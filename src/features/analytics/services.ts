import { getStorage, setStorage } from '../../api/extension';
import { STORAGE } from '../../config/config';
import cryptoRandomString from 'crypto-random-string';
import { POSTHOG_PROJECT_ID, PRODUCTION_TRACKING_MODE_ENABLED } from './config';
import { ExtensionViews, PostHogMetadata } from './types';

export const getAnalyticsConsent = (): Promise<boolean | undefined> =>
  getStorage(STORAGE.analyticsConsent);

export const setAnalyticsConsent = (consent: boolean): Promise<void> =>
  setStorage({ [STORAGE.analyticsConsent]: consent });

let userIdCache: string | undefined;

export const getUserId = async (): Promise<string> => {
  if (userIdCache) {
    return userIdCache;
  }

  const userId = await getStorage(STORAGE.userId);

  if (userId === undefined) {
    const newUserId = cryptoRandomString({ length: 64 });

    await setStorage({
      [STORAGE.userId]: newUserId,
    });

    userIdCache = newUserId;
    return newUserId;
  }

  userIdCache = userId;

  return userId;
};

const getNetwork = (): Promise<{ id: 'mainnet' | 'preprod' | 'preview' }> =>
  getStorage(STORAGE.network);

export const getEventMetadata = async (
  view: ExtensionViews
): Promise<PostHogMetadata> => {
  const [userId, currentNetwork] = await Promise.all([
    getUserId(),
    getNetwork(),
  ]);

  return {
    view: view,
    sent_at_local: new Date().toISOString(),
    distinct_id: userId,
    posthog_project_id: POSTHOG_PROJECT_ID,
    network: currentNetwork.id,
  };
};
