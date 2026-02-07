#pragma once

#include <JuceHeader.h>

class HalfTimeEffect
{
public:
  void prepare(const juce::dsp::ProcessSpec& spec);
  void setAmount(float newAmount);
  void setMix(float newMix);
  void setEnabled(bool isEnabled);
  void process(juce::dsp::AudioBlock<float>& block);

private:
  juce::AudioBuffer<float> buffer;
  int writeIndex = 0;
  float readIndex = 0.0f;
  float amount = 0.0f;
  float mix = 0.0f;
  bool enabled = false;
  int bufferSize = 0;
};
