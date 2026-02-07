#pragma once

#include <JuceHeader.h>

class ParameterSmoother
{
public:
  void prepare(double sampleRate);
  void setSmoothingTime(double seconds);
  void setTargetValue(float value);
  float getNextValue();

private:
  juce::SmoothedValue<float, juce::ValueSmoothingTypes::Linear> smoother;
  double smoothingTimeSeconds = 0.02;
};
