import React, { useEffect } from 'react';
import debounce from 'debounce';
import { useCaptureEvent } from './hooks';
import { Events } from './events';

const PAGE_VIEW_DEBOUNCE_DELAY = 1000;

const debouncedPageView = debounce((fn) => fn(), PAGE_VIEW_DEBOUNCE_DELAY);

export const EventTracker = () => {
  const capture = useCaptureEvent();

  // Track page changes with PostHog in order to keep the user session alive
  useEffect(() => {
    const trackActivePageChange = () =>
      debouncedPageView(() => {
        capture(Events.PageView);
      });

    window.addEventListener('load', trackActivePageChange);
    window.addEventListener('popstate', trackActivePageChange);

    trackActivePageChange();

    return () => {
      window.removeEventListener('load', trackActivePageChange);
      window.removeEventListener('popstate', trackActivePageChange);
    };
  }, [capture]);

  return null;
};
