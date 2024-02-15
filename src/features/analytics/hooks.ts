import { useCallback } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Events, Properties } from './events';
import { getAnalyticsConsent, getEventMetadata } from './services';
import { useAnalyticsContext } from './provider';

export const useCaptureEvent = () => {
  const posthog = usePostHog();
  const [analytics] = useAnalyticsContext();

  const captureEvent = useCallback(
    async (event: Events, properties: Properties = {}) => {
      const [hasConsent, metadata] = await Promise.all([
        getAnalyticsConsent(),
        getEventMetadata(analytics.view),
      ]);

      if (posthog && hasConsent) {
        posthog.capture(event, {
          ...properties,
          ...metadata,
        });
      }
    },
    [posthog, analytics.view]
  );

  return captureEvent;
};
