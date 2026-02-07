#include "ParameterSmoother.h"

void ParameterSmoother::prepare(double sampleRate)
{
  smoother.reset(sampleRate, smoothingTimeSeconds);
}

void ParameterSmoother::setSmoothingTime(double seconds)
{
  smoothingTimeSeconds = juce::jmax(0.0, seconds);
}

void ParameterSmoother::setTargetValue(float value)
{
  smoother.setTargetValue(value);
}

float ParameterSmoother::getNextValue()
{
  return smoother.getNextValue();
}
