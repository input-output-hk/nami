import { EarlyAccessFeature } from 'posthog-js';
import { usePostHog, useActiveFeatureFlags } from 'posthog-js/react';
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type MigrationFlag = {
  dismissInterval: number; // seconds to add to current time until migration prompt appears again
  dismissable: true; // can we dismiss the migration
};

type FeatureFlags = {
  ['is-migration-active']?: MigrationFlag;
  [key: string]: unknown;
};

/**
 * The feature flag React context which is exposed by the hook below
 */
export const FeatureFlagContext = createContext<{
  featureFlags?: FeatureFlags;
  earlyAccessFeatures?: EarlyAccessFeature[];
}>({});

/**
 * The public hook that should be used by components to interact with the
 * feature flags.
 */
export const useFeatureFlagsContext = () => {
  const featureFlagContext = useContext(FeatureFlagContext);
  if (featureFlagContext === null)
    throw new Error('feature flag context not defined');
  return featureFlagContext;
};

/**
 * The feature flag provider is separated from analytics
 * to provide the ability to read flags without the need
 * to accept analytics tracking.
 */
export const FeatureFlagProvider = ({ children }: { children: ReactNode }) => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>();
  const [earlyAccessFeatures, setEarlyAccessFeatures] =
    useState<EarlyAccessFeature[]>();
  const posthog = usePostHog();
  const activeFeatureFlags = useActiveFeatureFlags();

  useEffect(() => {
    posthog.getEarlyAccessFeatures((features) => {
      setEarlyAccessFeatures(features);
    });
  }, []);

  useEffect(() => {
    let enabledFlags: FeatureFlags = {};
    activeFeatureFlags?.forEach((flagName) => {
      const isEnabled = posthog.isFeatureEnabled(flagName);
      if (isEnabled) {
        const payload = posthog.getFeatureFlagPayload(flagName);
        if (payload) {
          enabledFlags[flagName] = payload;
        } else {
          enabledFlags[flagName] = true;
        }
      }
    });
    setFeatureFlags(enabledFlags);
  }, [activeFeatureFlags]);

  return (
    <FeatureFlagContext.Provider value={{ featureFlags, earlyAccessFeatures }}>
      {children}
    </FeatureFlagContext.Provider>
  );
};
