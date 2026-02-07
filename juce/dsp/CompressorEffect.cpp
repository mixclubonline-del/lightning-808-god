#include "CompressorEffect.h"

void CompressorEffect::prepare(const juce::dsp::ProcessSpec& spec)
{
  compressor.prepare(spec);
  makeupGain.prepare(spec);
  makeupGain.setGainLinear(1.0f);
}

void CompressorEffect::setThreshold(float newThresholdDb)
{
  compressor.setThreshold(newThresholdDb);
}

void CompressorEffect::setRatio(float newRatio)
{
  compressor.setRatio(newRatio);
}

void CompressorEffect::setAttack(float newAttackMs)
{
  compressor.setAttack(newAttackMs);
}

void CompressorEffect::setRelease(float newReleaseMs)
{
  compressor.setRelease(newReleaseMs);
}

void CompressorEffect::setMakeup(float newMakeup)
{
  makeupGain.setGainLinear(newMakeup);
}

void CompressorEffect::setEnabled(bool isEnabled)
{
  enabled = isEnabled;
}

void CompressorEffect::process(juce::dsp::AudioBlock<float>& block)
{
  if (!enabled) {
    return;
  }

  auto context = juce::dsp::ProcessContextReplacing<float>(block);
  compressor.process(context);
  makeupGain.process(context);
}
