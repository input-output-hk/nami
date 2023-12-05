export const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com';

export const PRODUCTION_TRACKING_MODE_ENABLED =
  process.env.PRODUCTION_MODE_TRACKING === 'true';

export const PRODUCTION_NETWORK_ID_TO_POSTHOG_PROJECT_ID_MAP = {
  ['mainnet']: 6621,
  ['preprod']: 6620,
  ['preview']: 6619,
} as const;

export const DEV_NETWORK_ID_TO_POSTHOG_PROJECT_ID_MAP = {
  ['mainnet']: 6315,
  ['preprod']: 6316,
  ['preview']: 4874,
} as const;
