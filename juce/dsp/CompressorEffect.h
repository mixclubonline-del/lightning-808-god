#pragma once

#include <JuceHeader.h>

class CompressorEffect
{
public:
  void prepare(const juce::dsp::ProcessSpec& spec);
  void setThreshold(float newThresholdDb);
  void setRatio(float newRatio);
  void setAttack(float newAttackMs);
  void setRelease(float newReleaseMs);
  void setMakeup(float newMakeup);
  void setEnabled(bool isEnabled);
  void process(juce::dsp::AudioBlock<float>& block);

private:
  juce::dsp::Compressor<float> compressor;
  juce::dsp::Gain<float> makeupGain;
  bool enabled = false;
};
