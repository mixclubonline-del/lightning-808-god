import { useState, useCallback } from 'react';
import { DeityName } from '@/types/deity';

export interface ParameterChange {
  [key: string]: number;
}

export interface ParameterSuggestion {
  changes: ParameterChange;
  explanation: string;
  deity_response: string;
}

interface UseDeityParametersOptions {
  deity: DeityName;
  currentParameters: Record<string, number>;
  onApplyChanges: (changes: ParameterChange) => void;
}

export function useDeityParameters({
  deity,
  currentParameters,
  onApplyChanges,
}: UseDeityParametersOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSuggestion, setLastSuggestion] = useState<ParameterSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const requestParameterChange = useCallback(async (userRequest: string): Promise<ParameterSuggestion | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deity-parameters`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            userRequest,
            currentParameters,
            deity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get parameter suggestions');
      }

      const suggestion: ParameterSuggestion = await response.json();
      setLastSuggestion(suggestion);

      // Auto-apply changes if there are any
      if (suggestion.changes && Object.keys(suggestion.changes).length > 0) {
        onApplyChanges(suggestion.changes);
      }

      return suggestion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Parameter suggestion error:', err);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [deity, currentParameters, onApplyChanges]);

  // Check if a message looks like a parameter request
  const isParameterRequest = useCallback((message: string): boolean => {
    const parameterKeywords = [
      'make it', 'more', 'less', 'increase', 'decrease', 'turn up', 'turn down',
      'add', 'remove', 'adjust', 'change', 'set', 'louder', 'quieter', 'softer',
      'harder', 'brighter', 'darker', 'warmer', 'colder', 'wetter', 'dryer',
      'punchier', 'aggressive', 'mellow', 'spacey', 'tight', 'snappy', 'longer',
      'shorter', 'faster', 'slower', 'boost', 'cut', 'raise', 'lower',
    ];

    const lowerMessage = message.toLowerCase();
    return parameterKeywords.some(keyword => lowerMessage.includes(keyword));
  }, []);

  return {
    isProcessing,
    lastSuggestion,
    error,
    requestParameterChange,
    isParameterRequest,
  };
}
