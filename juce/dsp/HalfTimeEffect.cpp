#include "HalfTimeEffect.h"

void HalfTimeEffect::prepare(const juce::dsp::ProcessSpec& spec)
{
  bufferSize = static_cast<int>(spec.sampleRate * 2.0);
  buffer.setSize(static_cast<int>(spec.numChannels), bufferSize);
  buffer.clear();
  writeIndex = 0;
  readIndex = 0.0f;
}

void HalfTimeEffect::setAmount(float newAmount)
{
  amount = juce::jlimit(0.0f, 1.0f, newAmount);
}

void HalfTimeEffect::setMix(float newMix)
{
  mix = juce::jlimit(0.0f, 1.0f, newMix);
}

void HalfTimeEffect::setEnabled(bool isEnabled)
{
  enabled = isEnabled;
}

void HalfTimeEffect::process(juce::dsp::AudioBlock<float>& block)
{
  if (!enabled || bufferSize == 0) {
    return;
  }

  const auto numSamples = static_cast<int>(block.getNumSamples());
  const float readStep = 0.5f + (1.0f - amount) * 0.5f;

  for (size_t channel = 0; channel < block.getNumChannels(); ++channel) {
    auto* channelData = block.getChannelPointer(channel);
    auto* bufferData = buffer.getWritePointer(static_cast<int>(channel));

    int localWriteIndex = writeIndex;
    float localReadIndex = readIndex;

    for (int i = 0; i < numSamples; ++i) {
      const float input = channelData[i];
      bufferData[localWriteIndex] = input;

      const int readIndexInt = static_cast<int>(localReadIndex) % bufferSize;
      const int readIndexNext = (readIndexInt + 1) % bufferSize;
      const float frac = localReadIndex - static_cast<float>(readIndexInt);
      const float delayed = juce::jmap(frac, bufferData[readIndexInt], bufferData[readIndexNext]);

      channelData[i] = input * (1.0f - mix) + delayed * mix;

      localWriteIndex = (localWriteIndex + 1) % bufferSize;
      localReadIndex += readStep;
      if (localReadIndex >= bufferSize) {
        localReadIndex -= bufferSize;
      }
    }
  }

  writeIndex = (writeIndex + numSamples) % bufferSize;
  readIndex += readStep * numSamples;
  while (readIndex >= bufferSize) {
    readIndex -= bufferSize;
  }
}
