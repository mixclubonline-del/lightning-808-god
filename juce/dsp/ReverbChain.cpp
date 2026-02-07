#include "ReverbChain.h"

void ReverbChain::prepare(const juce::dsp::ProcessSpec& spec)
{
  sampleRate = spec.sampleRate;
  pluto.reset();
  mars.reset();
  pastTime.reset();
  marsShimmer.reset();
  pastTimePreFilter.reset();

  pluto.prepare(spec);
  mars.prepare(spec);
  pastTime.prepare(spec);

  marsShimmer.state = juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, 1000.0);
  pastTimePreFilter.state = juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, 800.0);

  tempBuffer.setSize(static_cast<int>(spec.numChannels), static_cast<int>(spec.maximumBlockSize));
}

void ReverbChain::setPluto(float size, float damping, float mix, bool enabled)
{
  juce::dsp::Reverb::Parameters params;
  params.roomSize = juce::jlimit(0.0f, 1.0f, size);
  params.damping = juce::jlimit(0.0f, 1.0f, damping);
  params.wetLevel = 1.0f;
  params.dryLevel = 0.0f;
  params.width = 1.0f;
  pluto.setParameters(params);
  plutoMix = juce::jlimit(0.0f, 1.0f, mix);
  plutoEnabled = enabled;
}

void ReverbChain::setMars(float size, float shimmer, float mix, bool enabled)
{
  juce::dsp::Reverb::Parameters params;
  params.roomSize = juce::jlimit(0.0f, 1.0f, size);
  params.damping = 0.2f;
  params.wetLevel = 1.0f;
  params.dryLevel = 0.0f;
  params.width = 1.0f;
  mars.setParameters(params);
  const float shimmerHz = 500.0f + shimmer * 2500.0f;
  *marsShimmer.state = *juce::dsp::IIR::Coefficients<float>::makeHighPass(sampleRate, shimmerHz);
  marsMix = juce::jlimit(0.0f, 1.0f, mix);
  marsEnabled = enabled;
}

void ReverbChain::setPastTime(float size, float reverse, float mix, bool enabled)
{
  juce::dsp::Reverb::Parameters params;
  params.roomSize = juce::jlimit(0.0f, 1.0f, size);
  params.damping = 0.7f;
  params.wetLevel = 1.0f;
  params.dryLevel = 0.0f;
  params.width = 1.0f;
  pastTime.setParameters(params);
  pastTimeMix = juce::jlimit(0.0f, 1.0f, mix) * juce::jlimit(0.0f, 1.0f, reverse);
  pastTimeEnabled = enabled;
}

void ReverbChain::process(juce::dsp::AudioBlock<float>& block)
{
  const auto numSamples = static_cast<int>(block.getNumSamples());
  tempBuffer.setSize(static_cast<int>(block.getNumChannels()), numSamples, false, false, true);

  for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
    tempBuffer.copyFrom(static_cast<int>(channel), 0, block.getChannelPointer(channel), numSamples);
  }

  juce::dsp::AudioBlock<float> wetBlock(tempBuffer);
  if (plutoEnabled) {
    pluto.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));
    for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
      auto* dry = block.getChannelPointer(channel);
      auto* wet = wetBlock.getChannelPointer(channel);
      for (int i = 0; i < numSamples; ++i) {
        dry[i] = dry[i] * (1.0f - plutoMix) + wet[i] * plutoMix;
      }
    }
  }

  if (marsEnabled) {
    for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
      tempBuffer.copyFrom(static_cast<int>(channel), 0, block.getChannelPointer(channel), numSamples);
    }
    marsShimmer.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));
    mars.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));
    for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
      auto* dry = block.getChannelPointer(channel);
      auto* wet = wetBlock.getChannelPointer(channel);
      for (int i = 0; i < numSamples; ++i) {
        dry[i] = dry[i] * (1.0f - marsMix) + wet[i] * marsMix;
      }
    }
  }

  if (pastTimeEnabled) {
    for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
      tempBuffer.copyFrom(static_cast<int>(channel), 0, block.getChannelPointer(channel), numSamples);
    }
    pastTimePreFilter.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));
    pastTime.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));
    for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
      auto* dry = block.getChannelPointer(channel);
      auto* wet = wetBlock.getChannelPointer(channel);
      for (int i = 0; i < numSamples; ++i) {
        dry[i] = dry[i] * (1.0f - pastTimeMix) + wet[i] * pastTimeMix;
      }
    }
  }
}
