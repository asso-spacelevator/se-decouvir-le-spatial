import { useState, useEffect } from 'react';
import { useSession } from '../contexts/SessionContext';

export function useSectionState<T>(
  section: string,
  questionId: string,
  initialValue: T
): [T, (value: T) => void] {
  const { saveResponse, getResponses } = useSession();
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadValue = async () => {
      const responses = await getResponses(section);
      if (responses[questionId]) {
        try {
          const parsed = JSON.parse(responses[questionId]);
          setValue(parsed);
        } catch {
          setValue(responses[questionId] as T);
        }
      }
      setIsLoaded(true);
    };
    loadValue();
  }, [section, questionId]);

  const updateValue = async (newValue: T) => {
    setValue(newValue);
    if (isLoaded) {
      const serialized = typeof newValue === 'object'
        ? JSON.stringify(newValue)
        : String(newValue);
      await saveResponse(section, questionId, serialized);
    }
  };

  return [value, updateValue];
}
