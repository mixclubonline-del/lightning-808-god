#include "Distortion.h"

void Distortion::prepare(const juce::dsp::ProcessSpec& spec)
{
  sampleRate = spec.sampleRate;
  waveshaper.reset();
  toneFilter.reset();
  wetBuffer.setSize(static_cast<int>(spec.numChannels), static_cast<int>(spec.maximumBlockSize));
  toneFilter.state = juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, 8000.0);

  waveshaper.functionToUse = [this](float x) {
    const float k = juce::jlimit(0.0f, 1.0f, drive);
    const float driveAmount = 1.0f + k * 20.0f;
    return std::tanh(x * driveAmount);
  };
}

void Distortion::setDrive(float newDrive)
{
  drive = juce::jlimit(0.0f, 1.0f, newDrive);
}

void Distortion::setMix(float newMix)
{
  mix = juce::jlimit(0.0f, 1.0f, newMix);
}

void Distortion::setTone(float newTone)
{
  tone = juce::jlimit(0.0f, 1.0f, newTone);
}

void Distortion::process(juce::dsp::AudioBlock<float>& block)
{
  if (block.getNumChannels() == 0) {
    return;
  }

  const auto numSamples = static_cast<int>(block.getNumSamples());
  wetBuffer.setSize(static_cast<int>(block.getNumChannels()), numSamples, false, false, true);

  for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
    wetBuffer.copyFrom(static_cast<int>(channel), 0, block.getChannelPointer(channel), numSamples);
  }

  juce::dsp::AudioBlock<float> wetBlock(wetBuffer);
  waveshaper.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));

  const float cutoff = 500.0f + (tone * 7500.0f);
  *toneFilter.state = *juce::dsp::IIR::Coefficients<float>::makeLowPass(sampleRate, cutoff);
  toneFilter.process(juce::dsp::ProcessContextReplacing<float>(wetBlock));

  const float dryMix = 1.0f - mix;
  for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
    auto* dry = block.getChannelPointer(channel);
    auto* wet = wetBlock.getChannelPointer(channel);
    for (int sample = 0; sample < numSamples; ++sample) {
      dry[sample] = dry[sample] * dryMix + wet[sample] * mix;
    }
  }
}
