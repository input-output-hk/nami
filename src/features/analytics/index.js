import { useEffect, useState } from 'react';
import { getStorage, setStorage } from '../../api/extension';
import { STORAGE } from '../../config/config';

// returns: Promise<boolean | undefined>
const getAnalyticsConsent = () => getStorage(STORAGE.analyticsConsent);

const setAnalyticsConsent = (consent) =>
  setStorage({ [STORAGE.analyticsConsent]: consent });

/**
 * Provides access to the analytics user consent stored
 * in chrome.storage.local accessible in all parts of the
 * extension UI. It exposes only the current consent and
 * a method to toggle it.
 *
 * User consent is stored as boolean | undefined
 */
export const useAnalyticsConsent = () => {
  // Store the consent in React state to trigger component updates
  const [consent, setConsentState] = useState();
  // Fetch the stored user consent and assign to React state
  useEffect(async () => {
    setConsentState(await getAnalyticsConsent());
  }, []);
  return [
    consent,
    async (consent) => {
      // Allow to set the consent state and store it too
      setConsentState(consent);
      await setAnalyticsConsent(consent);
    },
  ];
};
