import { useCallback, useEffect, useState } from 'react';
import {
  getAcceptedLegalDocsVersion,
  setAcceptedLegalDocsVersion,
} from './services';
import { CURRENT_VERSION } from './config';

export const useAcceptDocs = () => {
  const [accepted, setAccepted] = useState(false);

  return {
    accepted,
    setAccepted: useCallback(
      (accepted: boolean) => {
        setAccepted(accepted);
        setAcceptedLegalDocsVersion(accepted ? CURRENT_VERSION : undefined);
      },
      [setAccepted]
    ),
  };
};

export const useShowUpdatePrompt = () => {
  const [shouldShowUpdatePrompt, setShouldShowUpdatePrompt] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const init = async () => {
      const acceptedVersion = await getAcceptedLegalDocsVersion();

      if (acceptedVersion) {
        setShouldShowUpdatePrompt(acceptedVersion < CURRENT_VERSION);
      } else {
        setShouldShowUpdatePrompt(true);
      }
    };

    init();
  }, []);

  return {
    shouldShowUpdatePrompt,
    hideUpdatePrompt: useCallback(() => {
      setShouldShowUpdatePrompt(false);
    }, [setShouldShowUpdatePrompt]),
  };
};
