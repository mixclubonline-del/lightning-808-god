#pragma once

#include <JuceHeader.h>

class ReverbChain
{
public:
  void prepare(const juce::dsp::ProcessSpec& spec);
  void setPluto(float size, float damping, float mix, bool enabled);
  void setMars(float size, float shimmer, float mix, bool enabled);
  void setPastTime(float size, float reverse, float mix, bool enabled);
  void process(juce::dsp::AudioBlock<float>& block);

private:
  juce::dsp::Reverb pluto;
  juce::dsp::Reverb mars;
  juce::dsp::Reverb pastTime;
  juce::dsp::IIR::Filter<float> marsShimmer;
  juce::dsp::IIR::Filter<float> pastTimePreFilter;
  juce::AudioBuffer<float> tempBuffer;

  double sampleRate = 44100.0;
  bool plutoEnabled = false;
  bool marsEnabled = false;
  bool pastTimeEnabled = false;
  float plutoMix = 0.0f;
  float marsMix = 0.0f;
  float pastTimeMix = 0.0f;
};
