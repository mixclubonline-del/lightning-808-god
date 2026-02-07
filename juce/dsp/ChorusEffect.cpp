#include "ChorusEffect.h"

void ChorusEffect::prepare(const juce::dsp::ProcessSpec& spec)
{
  chorus.prepare(spec);
  chorus.setCentreDelay(7.0f);
  chorus.setFeedback(0.1f);
  chorus.setMix(0.5f);
}

void ChorusEffect::setRate(float newRate)
{
  chorus.setRate(0.1f + (newRate * 9.9f));
}

void ChorusEffect::setDepth(float newDepth)
{
  chorus.setDepth(juce::jlimit(0.0f, 1.0f, newDepth));
}

void ChorusEffect::setMix(float newMix)
{
  mix = juce::jlimit(0.0f, 1.0f, newMix);
  chorus.setMix(mix);
}

void ChorusEffect::setEnabled(bool isEnabled)
{
  enabled = isEnabled;
}

void ChorusEffect::process(juce::dsp::AudioBlock<float>& block)
{
  if (!enabled) {
    return;
  }

  chorus.process(juce::dsp::ProcessContextReplacing<float>(block));
}
