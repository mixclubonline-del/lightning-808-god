#pragma once

#include <JuceHeader.h>

class ChorusEffect
{
public:
  void prepare(const juce::dsp::ProcessSpec& spec);
  void setRate(float newRate);
  void setDepth(float newDepth);
  void setMix(float newMix);
  void setEnabled(bool isEnabled);
  void process(juce::dsp::AudioBlock<float>& block);

private:
  juce::dsp::Chorus<float> chorus;
  float mix = 0.0f;
  bool enabled = false;
};
