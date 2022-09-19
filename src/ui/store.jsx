import React from 'react';
import {
  getCurrency,
  getNetwork,
  requestAccountKey,
  setCurrency,
  setNetwork,
} from '../api/extension';
import { NETWORK_ID, NODE } from '../config/config';
import {
  createStore,
  action,
  useStoreActions,
  StoreProvider,
  useStoreState,
  persist,
  useStoreRehydrated,
} from 'easy-peasy';
import { Box, Text } from '@chakra-ui/layout';
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { Spinner } from '@chakra-ui/react';
import {
  needUpgrade,
  needPWD,
  migrate,
  setPWD,
  isUpgrade,
} from '../lib/migration';
import ConfirmModal from './app/components/confirmModal';
import { UpgradeModal } from './app/components/UpgradeModal';
import { sendStore } from './app/pages/send';

const settings = {
  settings: null,
  setSettings: action((state, settings) => {
    setCurrency(settings.currency);
    setNetwork(settings.network);
    state.settings = {
      ...settings,
      adaSymbol: settings.network.id === NETWORK_ID.mainnet ? '₳' : 't₳',
    };
  }),
};

const routeStore = {
  route: null,
  setRoute: action((state, route) => {
    state.route = route;
  }),
};

const globalModel = persist(
  {
    routeStore,
    sendStore,
  },
  { storage: 'localStorage' }
);

const initSettings = async (setSettings) => {
  const currency = await getCurrency();
  const network = await getNetwork();
  setSettings({
    currency: currency || 'usd',
    network: network || { id: NETWORK_ID.mainnet, node: NODE.mainnet },
    adaSymbol: network ? (network.id === NETWORK_ID.mainnet ? '₳' : 't₳') : '₳',
  });
};

// create the global store object
const store = createStore({
  globalModel,
  settings,
});

// sets the initial store state
const initStore = async (state, actions) => {
  await initSettings(actions.settings.setSettings);
};

// Store component that loads the store and calls initStore
const StoreInit = ({ children }) => {
  const actions = useStoreActions((actions) => actions);
  const state = useStoreState((state) => state);
  const settings = state.settings.settings;
  const [isLoading, setIsLoading] = React.useState(true);
  const isRehydrated = useStoreRehydrated();
  const [info, setInfo] = React.useState(null);
  const [password, setPassword] = React.useState(false);
  const refA = React.useRef();
  const refB = React.useRef();

  const init = async () => {
    if (await needUpgrade()) {
      await upgrade();
    } else {
      await initStore(state, actions);
      setIsLoading(false);
      if (info && info.length) {
        refB.current.openModal();
      }
    }
  };

  const upgrade = async () => {
    let pwdReq = await needPWD();
    if (pwdReq) {
      refA.current.openModal();
      return;
    }
    let isUp = await isUpgrade();
    let info = await migrate();
    setInfo(isUp ? info : false);
  };

  React.useEffect(() => {
    init();
  }, [password, info]);
  return (
    <>
      {isLoading || !isRehydrated ? (
        <>
          <Box
            height="100vh"
            width="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner color="teal" speed="0.5s" />
          </Box>

          <ConfirmModal
            ref={refA}
            title="Update requires password"
            sign={async (pwd) => {
              await requestAccountKey(pwd, 0);
              setPWD(pwd);
            }}
            onConfirm={async (status) => {
              if (status === true) {
                setPassword(true);
                refA.current.closeModal();
              }
            }}
            onCloseBtn={() => {
              window.close();
            }}
          />
        </>
      ) : (
        <>
          {children}
          {info && info.length ? <UpgradeModal info={info} ref={refB} /> : ''}
          {/* Settings Overlay */}
          {settings.network.id !== NETWORK_ID.mainnet && (
            <Box
              position="absolute"
              left="3"
              bottom="3"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight="semibold"
              color="orange.400"
            >
              <InfoOutlineIcon />
              <Box width="1" />
              <Text>
                {(() => {
                  switch (settings.network.id) {
                    case NETWORK_ID.testnet:
                      return 'Testnet';
                    case NETWORK_ID.preview:
                      return 'Preview';
                    case NETWORK_ID.preprod:
                      return 'Preprod';
                  }
                })()}
              </Text>
            </Box>
          )}
        </>
      )}
    </>
  );
};

// wrapping the StoreInit component inside the actual StoreProvider in order to initialize the store state
export default ({ children }) => {
  return (
    <StoreProvider store={store}>
      <StoreInit>{children}</StoreInit>
    </StoreProvider>
  );
};
