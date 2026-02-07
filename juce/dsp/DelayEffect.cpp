#include "DelayEffect.h"

void DelayEffect::prepare(const juce::dsp::ProcessSpec& spec)
{
  delays.clear();
  delays.resize(spec.numChannels);
  for (auto& delay : delays) {
    delay.reset();
    delay.prepare(spec);
    delay.setMaximumDelayInSamples(static_cast<int>(spec.sampleRate * maxDelaySeconds));
  }
}

void DelayEffect::setTimeSeconds(float seconds)
{
  delayTimeSeconds = juce::jlimit(0.0f, maxDelaySeconds, seconds);
  for (auto& delay : delays) {
    delay.setDelay(delayTimeSeconds * delay.getSampleRate());
  }
}

void DelayEffect::setFeedback(float newFeedback)
{
  feedback = juce::jlimit(0.0f, 0.95f, newFeedback);
}

void DelayEffect::setMix(float newMix)
{
  mix = juce::jlimit(0.0f, 1.0f, newMix);
}

void DelayEffect::setEnabled(bool isEnabled)
{
  enabled = isEnabled;
}

void DelayEffect::process(juce::dsp::AudioBlock<float>& block)
{
  if (!enabled) {
    return;
  }

  const auto numSamples = static_cast<int>(block.getNumSamples());
  for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
    auto* channelData = block.getChannelPointer(channel);
    auto& delay = delays[channel];

    for (int i = 0; i < numSamples; ++i) {
      const float in = channelData[i];
      const float delayed = delay.popSample(0);
      delay.pushSample(0, in + delayed * feedback);
      channelData[i] = in * (1.0f - mix) + delayed * mix;
    }
  }
}
