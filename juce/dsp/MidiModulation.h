#pragma once

#include <JuceHeader.h>

struct MidiModulationSlot
{
  int ccNumber = -1;
  float depth = 0.0f;
  float lastValue = 0.0f;
};

class MidiModulationMatrix
{
public:
  void addSlot(int parameterId, int ccNumber, float depth);
  void clear();
  void processMidi(const juce::MidiBuffer& midi);
  float applyModulation(int parameterId, float baseValue) const;

private:
  std::unordered_map<int, MidiModulationSlot> slots;
};
