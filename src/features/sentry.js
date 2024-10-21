import * as Sentry from '@sentry/react';

Sentry.init({
  environment: process.env.NODE_ENV,
  dsn: process.env.SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.browserProfilingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Set `tracePropagationTargets` to control for which URLs trace propagation should be enabled
  tracePropagationTargets: [
    'localhost',
    'chrome-extension://lpfcbjknijpeeillifnkikgncikgfhdo',
  ],
  // .5%
  tracesSampleRate: 0.05,
  profilesSampleRate: 0.05,
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // A tracesSampleRate of 0.05 and profilesSampleRate of 0.05 results in 2.5% of
  // transactions being profiled (0.05*0.05=0.0025)

  // Capture Replay for 0.5% of all sessions,
  replaysSessionSampleRate: 0.005,
  // ...plus for 100% of sessions with an error
  replaysOnErrorSampleRate: 1.0,
});
