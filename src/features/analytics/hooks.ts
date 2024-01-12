import { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Events, Properties } from './events';
import {
  getAnalyticsConsent,
  getEventMetadata,
  setAnalyticsConsent,
} from './services';
import { useAnalyticsContext } from './provider';

/**
 * Provides access to the analytics user consent stored
 * in chrome.storage.local accessible in all parts of the
 * extension UI. It exposes only the current consent and
 * a method to toggle it.
 *
 * User consent is stored as boolean | undefined
 */
export const useAnalyticsConsent = (): [
  boolean | undefined,
  (consent: boolean) => Promise<void>,
] => {
  // Store the consent in React state to trigger component updates
  const [consent, setConsentState] = useState<boolean | undefined>();
  // Fetch the stored user consent and assign to React state

  useEffect(() => {
    (async function () {
      setConsentState(await getAnalyticsConsent());
    })();
  }, []);

  return [
    consent,
    async (consent) => {
      // Allow to set the consent state and store it too
      await setAnalyticsConsent(consent);
      setConsentState(consent);
    },
  ];
};

export const useCaptureEvent = () => {
  const posthog = usePostHog();
  const view = useAnalyticsContext();

  const captureEvent = useCallback(
    async (event: Events, properties: Properties = {}) => {
      const [hasConsent, metadata] = await Promise.all([
        getAnalyticsConsent(),
        getEventMetadata(view),
      ]);

      if (posthog && hasConsent) {
        posthog.capture(event, {
          ...properties,
          ...metadata,
        });
      }
    },
    [posthog, view]
  );

  return captureEvent;
};
