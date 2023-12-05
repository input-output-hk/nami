import { PostHogProvider } from 'posthog-js/react';
import { PostHogConfig } from 'posthog-js';
import React, {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext,
} from 'react';
import { getAnalyticsConsent, getUserId } from './services';
import { getOptions } from './posthog';
import { ExtensionViews } from './types';

interface Props {
  children: ReactNode;
  view: ExtensionViews;
}

interface State {
  consent?: boolean;
  userId: string;
}

const ExtensionViewsContext = createContext<ExtensionViews | null>(null);

export const useAnalyticsContext = () => {
  const analyticsContext = useContext(ExtensionViewsContext);
  if (analyticsContext === null) throw new Error('context not defined');
  return analyticsContext;
};

export const AnalyticsProvider = ({ children, view }: Props) => {
  const [state, setState] = useState<State>();

  useEffect(() => {
    const init = async () => {
      const [consent, userId] = await Promise.all([
        getAnalyticsConsent(),
        getUserId(),
      ]);

      setState({
        consent,
        userId,
      });
    };

    init();
  }, []);

  const options = useMemo<Partial<PostHogConfig> | undefined>(() => {
    const id = state?.userId;

    if (id === undefined) {
      return undefined;
    }

    return getOptions(id);
  }, [state?.userId]);

  if (state?.consent === false || options === undefined) {
    return (
      <ExtensionViewsContext.Provider value={view}>
        {children}
      </ExtensionViewsContext.Provider>
    );
  }

  return (
    <PostHogProvider options={options}>
      <ExtensionViewsContext.Provider value={view}>
        {children}
      </ExtensionViewsContext.Provider>
    </PostHogProvider>
  );
};
