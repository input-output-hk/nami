import React, { useEffect } from 'react';
import debounce from 'debounce';
import { useCaptureEvent } from './hooks';
import { Events } from './events';

const PAGE_VIEW_DEBOUNCE_DELAY = 100;

export const EventTracker = () => {
  const capture = useCaptureEvent();

  // Track page changes with PostHog in order to keep the user session alive
  useEffect(() => {
    const trackActivePageChange = debounce(
      () => capture(Events.PageView),
      PAGE_VIEW_DEBOUNCE_DELAY
    );
    window.addEventListener('load', trackActivePageChange);
    window.addEventListener('popstate', trackActivePageChange);
    return () => {
      window.removeEventListener('load', trackActivePageChange);
      window.removeEventListener('popstate', trackActivePageChange);
    };
  }, [capture]);

  return null;
};
