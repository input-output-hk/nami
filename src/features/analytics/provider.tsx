import { PostHogProvider } from 'posthog-js/react';
import { PostHogConfig } from 'posthog-js';
import React, {
  ReactNode,
  useMemo,
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { getOptions } from './posthog';
import { ExtensionViews } from './types';
import { POSTHOG_API_KEY } from './config';
import {
  getAnalyticsConsent,
  getUserId,
  setAnalyticsConsent,
} from './services';

/**
 * Represents the user's consent to tracking analytics events
 * as well as the current extension view for tracked events
 */
interface AnalyticsState {
  consent?: boolean;
  userId?: string;
  view: ExtensionViews;
}

/**
 * Provides access to the AnalyticsState and handling
 * the storage of userId and consent in chrome.storage.local
 */
const useAnalyticsState = (
  view: ExtensionViews
): [AnalyticsState, (consent: boolean) => Promise<void>] => {
  // Store the consent in React state to trigger component updates
  const [consentState, setConsentState] = useState<AnalyticsState>({
    view,
  });

  // Fetch the stored user consent and assign to React state
  useEffect(() => {
    (async function () {
      const [consent, userId] = await Promise.all([
        getAnalyticsConsent(),
        getUserId(),
      ]);
      setConsentState({
        consent,
        userId,
        view,
      });
    })();
  }, []);

  return [
    consentState,
    async (consent) => {
      // Allow to set the consent state and store it too
      await setAnalyticsConsent(consent);
      setConsentState({
        consent,
        userId: consentState.userId,
        view,
      });
    },
  ];
};

/**
 * The analytics React context which is exposed by the hook below
 */
const AnalyticsContext = createContext<ReturnType<
  typeof useAnalyticsState
> | null>(null);

/**
 * The public hook that should be used by components to interact with the
 * analytics state.
 */
export const useAnalyticsContext = () => {
  const analyticsContext = useContext(AnalyticsContext);
  if (analyticsContext === null) throw new Error('context not defined');
  return analyticsContext;
};

/**
 * The analytics provider that wraps the current extension
 * view to set up the PostHog provider and the API to interact
 * with the analytics state.
 */
export const AnalyticsProvider = ({
  children,
  view,
}: {
  children: ReactNode;
  view: ExtensionViews;
}) => {
  const [analyticsState, setAnalyticsConsent] = useAnalyticsState(view);

  const options = useMemo<Partial<PostHogConfig> | undefined>(() => {
    const id = analyticsState?.userId;

    if (id === undefined) {
      return undefined;
    }

    return getOptions(id);
  }, [analyticsState?.userId]);

  if (analyticsState?.consent === false || options === undefined) {
    return (
      <AnalyticsContext.Provider value={[analyticsState, setAnalyticsConsent]}>
        {children}
      </AnalyticsContext.Provider>
    );
  }

  return (
    <PostHogProvider apiKey={POSTHOG_API_KEY} options={options}>
      <AnalyticsContext.Provider value={[analyticsState, setAnalyticsConsent]}>
        {children}
      </AnalyticsContext.Provider>
    </PostHogProvider>
  );
};
