import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Image,
  Skeleton,
  useColorModeValue,
  Button,
  Collapse,
} from '@chakra-ui/react';
import { useStoreActions, useStoreState } from 'easy-peasy';
import React from 'react';
import Copy from './copy';
import UnitDisplay from './unitDisplay';
import { useHistory } from 'react-router-dom';
import { BsArrowUpRight } from 'react-icons/bs';
import { getAsset } from '../../../api/extension';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const Asset = ({ asset, enableSend, ...props }) => {
  const isMounted = useIsMounted();
  const [token, setToken] = React.useState(null);
  const background = useColorModeValue('gray.100', 'gray.700');
  const [show, setShow] = React.useState(false);
  const [value, setValue] = [
    useStoreState((state) => state.globalModel.sendStore.value),
    useStoreActions((actions) => actions.globalModel.sendStore.setValue),
  ];
  const history = useHistory();
  const settings = useStoreState((state) => state.settings.settings);

  const fetchMetadata = async () => {
    const detailedAsset =
      asset.unit === 'lovelace'
        ? {
            ...asset,
            displayName: 'Ada',
            decimals: 6,
          }
        : {
            ...(await getAsset(asset.unit)),
            quantity: asset.quantity,
            input: asset.input,
          };
    if (!isMounted.current) return;
    setToken(detailedAsset);
  };

  React.useEffect(() => {
    fetchMetadata();
  }, [asset]);
  return !token ? (
    <Skeleton width="90%" height="70px" rounded="xl" />
  ) : (
    <Box
      display="flex"
      alignItems="center"
      width="90%"
      rounded="xl"
      background={background}
      onClick={() => token.unit !== 'lovelace' && setShow(!show)}
      cursor="pointer"
      overflow="hidden"
    >
      <Collapse startingHeight={60} in={show} style={{ width: '100%' }}>
        <Box
          width="100%"
          height="60px"
          display="flex"
          alignItems="center"
          px={4}
        >
          <Box width="44px" height="44px" rounded="full" overflow="hidden">
            <Image
              draggable={false}
              width="full"
              src={token.image}
              fallback={
                !token.image ? (
                  token.unit === 'lovelace' ? (
                    <Box
                      width={'full'}
                      height={'full'}
                      background={'blue.500'}
                      color={'white'}
                      display={'flex'}
                      alignItems={'center'}
                      justifyContent={'center'}
                      fontSize={'xl'}
                      fontWeight={'medium'}
                    >
                      {settings.adaSymbol}
                    </Box>
                  ) : (
                    <Avatar width="full" height="full" name={token.name} />
                  )
                ) : (
                  <Fallback name={token.name} />
                )
              }
            />
          </Box>

          <Box w={4} />
          <Box
            width="90px"
            className="lineClamp"
            fontWeight="bold"
            overflow="hidden"
          >
            {token.displayName}
          </Box>
          <Box w={4} />
          <Box
            width="120px"
            textAlign="center"
            py={1}
            background={props.background}
            color={props.color}
            rounded={'xl'}
          >
            <UnitDisplay
              quantity={token.quantity}
              decimals={token.decimals ? token.decimals : 0}
            />
          </Box>
        </Box>
        <Box h={4} />
        <Box px={10} display="flex" width="full" wordBreak="break-all">
          <Box width="140px" fontWeight="bold" fontSize={12}>
            Policy
          </Box>
          <Box fontSize={10} width="340px" onClick={(e) => e.stopPropagation()}>
            <Copy label="Copied policy" copy={token.policy}>
              {token.policy}
            </Copy>
          </Box>
        </Box>
        <Box h={4} />
        <Box px={10} display="flex" width="full" wordBreak="break-all">
          <Box width="140px" fontWeight="bold" fontSize={12}>
            Asset
          </Box>
          <Box fontSize={10} width="340px" onClick={(e) => e.stopPropagation()}>
            <Copy label="Copied asset" copy={token.fingerprint}>
              {token.fingerprint}
            </Copy>
          </Box>
        </Box>

        <Box h={2} />
        {enableSend && (
          <>
            <Box width="full" display="flex" justifyContent="right">
              <Button
                mr="4"
                background={background == 'gray.100' ? 'gray.200' : 'gray.600'}
                size="xs"
                rightIcon={<BsArrowUpRight />}
                onClick={(e) => {
                  setValue({ ...value, assets: [asset] });
                  history.push('/send');
                }}
              >
                Send
              </Button>
            </Box>
          </>
        )}
        <Box h={2} />
      </Collapse>
    </Box>
  );
};

const Fallback = ({ name }) => {
  const [timedOut, setTimedOut] = React.useState(false);
  const isMounted = useIsMounted();
  React.useEffect(() => {
    setTimeout(() => isMounted.current && setTimedOut(true), 30000);
  }, []);
  if (timedOut) return <Avatar name={name} />;
  return <Skeleton width="full" height="full" />;
};

export default Asset;
