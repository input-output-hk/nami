import secrets from '../../config/provider';

export const PUBLIC_POSTHOG_HOST = 'https://eu.posthog.com';

export const PRODUCTION_TRACKING_MODE_ENABLED = 'true';

export const POSTHOG_API_KEY = secrets.posthog_api_token;
export const POSTHOG_PROJECT_ID = secrets.posthog_project_id;
