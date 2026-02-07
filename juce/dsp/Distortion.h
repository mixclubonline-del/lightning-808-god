#pragma once

#include <JuceHeader.h>

class Distortion
{
public:
  void prepare(const juce::dsp::ProcessSpec& spec);
  void setDrive(float newDrive);
  void setMix(float newMix);
  void setTone(float newTone);
  void process(juce::dsp::AudioBlock<float>& block);

private:
  juce::dsp::WaveShaper<float> waveshaper;
  juce::dsp::IIR::Filter<float> toneFilter;
  juce::AudioBuffer<float> wetBuffer;
  double sampleRate = 44100.0;
  float drive = 0.0f;
  float mix = 0.0f;
  float tone = 0.5f;
};
