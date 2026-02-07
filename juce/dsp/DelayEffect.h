#pragma once

#include <JuceHeader.h>

class DelayEffect
{
public:
  void prepare(const juce::dsp::ProcessSpec& spec);
  void setTimeSeconds(float seconds);
  void setFeedback(float newFeedback);
  void setMix(float newMix);
  void setEnabled(bool isEnabled);
  void process(juce::dsp::AudioBlock<float>& block);

private:
  static constexpr float maxDelaySeconds = 2.0f;
  std::vector<juce::dsp::DelayLine<float, juce::dsp::DelayLineInterpolationTypes::Linear>> delays;
  float delayTimeSeconds = 0.0f;
  float feedback = 0.0f;
  float mix = 0.0f;
  bool enabled = false;
};
