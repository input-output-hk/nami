import { useCallback, useEffect, useState } from 'react';
import {
  getAcceptedLegalDocsVersion,
  setAcceptedLegalDocsVersion,
} from './services';
import { CURRENT_VERSION } from './config';

export const useAcceptDocs = () => {
  const [accept, setAccept] = useState(false);

  return {
    accept,
    setAccept: useCallback(
      (accepted: boolean) => {
        setAccept(accepted);
        setAcceptedLegalDocsVersion(accepted ? CURRENT_VERSION : undefined);
      },
      [setAccept]
    ),
  };
};

export const useShowUpdatePrompt = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    const init = async () => {
      const acceptedVersion = await getAcceptedLegalDocsVersion();

      if (acceptedVersion) {
        setShowUpdatePrompt(acceptedVersion < CURRENT_VERSION);
      } else {
        setShowUpdatePrompt(true);
      }
    };

    init();
  }, []);

  return {
    showUpdatePrompt,
    hideUpdatePrompt: useCallback(() => {
      setShowUpdatePrompt(false);
    }, [setShowUpdatePrompt]),
  };
};
