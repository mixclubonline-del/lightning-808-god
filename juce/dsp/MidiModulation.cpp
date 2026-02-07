#include "MidiModulation.h"

void MidiModulationMatrix::addSlot(int parameterId, int ccNumber, float depth)
{
  MidiModulationSlot slot;
  slot.ccNumber = ccNumber;
  slot.depth = juce::jlimit(0.0f, 1.0f, depth);
  slots[parameterId] = slot;
}

void MidiModulationMatrix::clear()
{
  slots.clear();
}

void MidiModulationMatrix::processMidi(const juce::MidiBuffer& midi)
{
  for (const auto metadata : midi) {
    const auto& message = metadata.getMessage();
    if (!message.isController()) {
      continue;
    }

    const int ccNumber = message.getControllerNumber();
    const float value = message.getControllerValue() / 127.0f;

    for (auto& [parameterId, slot] : slots) {
      if (slot.ccNumber == ccNumber) {
        slot.lastValue = value;
      }
    }
  }
}

float MidiModulationMatrix::applyModulation(int parameterId, float baseValue) const
{
  const auto found = slots.find(parameterId);
  if (found == slots.end()) {
    return baseValue;
  }

  const auto& slot = found->second;
  const float modAmount = slot.lastValue * slot.depth;
  return juce::jlimit(0.0f, 1.0f, baseValue + modAmount);
}
