import { PostHogConfig } from 'posthog-js';
import { PUBLIC_POSTHOG_HOST } from './config';

export const getOptions = (userId: string): Partial<PostHogConfig> => ({
  request_batching: false,
  api_host: PUBLIC_POSTHOG_HOST,
  autocapture: false,
  disable_session_recording: true,
  capture_pageview: false,
  capture_pageleave: false,
  disable_compression: true,
  // Disables PostHog user ID persistence - we manage ID ourselves with userIdService
  disable_persistence: true,
  disable_cookie: true,
  persistence: 'memory',
  bootstrap: {
    distinctID: userId,
    isIdentifiedID: true,
  },
  property_blacklist: [
    '$autocapture_disabled_server_side',
    '$console_log_recording_enabled_server_side',
    '$device_id',
    '$session_recording_recorder_version_server_side',
    '$time',
  ],
});
