import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Image,
  Skeleton,
  SkeletonCircle,
  Text,
  Button,
} from '@chakra-ui/react';
import React from 'react';
import {
  blockfrostRequest,
  convertMetadataPropToString,
  linkToSrc,
} from '../../../api/util';
import AssetPopover from './assetPopover';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

const Asset = ({ asset, onLoad, storedAssets, port }) => {
  const isMounted = useIsMounted();
  const [token, setToken] = React.useState(null);

  const fetchMetadata = async () => {
    if (storedAssets[asset.unit]) {
      setToken({ ...storedAssets[asset.unit], quantity: asset.quantity });
      return;
    }
    const result = await blockfrostRequest(`/assets/${asset.unit}`);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      asset.name;
    let image =
      (result.onchain_metadata &&
        result.onchain_metadata.image &&
        linkToSrc(
          convertMetadataPropToString(result.onchain_metadata.image)
        )) ||
      (result.metadata && linkToSrc(result.metadata.logo, true)) ||
      '';
    setToken({ displayName: name, ...asset, image });

    // Will be enabled again when ipfs-js is more reliable to use
    // if (image && isIPFS.multihash(image)) {
    //   const port = chrome.runtime.connect({
    //     name: 'IPFS-' + asset.unit,
    //   });
    //   port.postMessage({
    //     hash: image,
    //   });
    //   image = await new Promise((res, rej) =>
    //     port.onMessage.addListener(function listener(url) {
    //       port.onMessage.removeListener(listener);
    //       res(url);
    //       return;
    //     })
    //   );
    // }
    onLoad({
      displayName: name,
      image,
      ...asset,
    });
    if (!isMounted.current) return;
    setToken((t) => ({
      ...t,
      image,
    }));
  };

  React.useEffect(() => {
    fetchMetadata();
  }, [asset]);
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      width="full"
      height="full"
    >
      <AssetPopover asset={token}>
        <Box
          rounded="lg"
          overflow="hidden"
          width="16"
          height="20"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          userSelect="none"
        >
          {!token ? (
            <SkeletonCircle size="14" />
          ) : (
            <Button
              style={{
                all: 'revert',
                background: 'none',
                border: 'none',
                outline: 'none',
                padding: 0,
                margin: 0,
                cursor: 'pointer',
              }}
            >
              <Image
                width="full"
                rounded="sm"
                src={token.image}
                fallback={
                  !token.image ? (
                    <Avatar name={token.name} />
                  ) : (
                    <Fallback name={token.name} />
                  )
                }
              />
            </Button>
          )}
        </Box>
      </AssetPopover>

      <Box
        width="74px"
        height="40px"
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
      >
        {!token ? (
          <Skeleton height="16px" width="80%" />
        ) : (
          <>
            <Text userSelect="text" fontSize="9" textAlign="center">
              {token.quantity}
            </Text>
            {/* <Box height="1" /> */}
            <Text
              fontSize="xs"
              userSelect="text"
              className="lineClamp"
              overflow="hidden"
              height="40px"
              maxWidth="74px"
              fontWeight="semibold"
              color="GrayText"
              lineHeight="1.1"
              textAlign="center"
            >
              {token.displayName}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
};

const Fallback = ({ name }) => {
  const [timedOut, setTimedOut] = React.useState(false);
  React.useEffect(() => {
    setTimeout(() => setTimedOut(true), 30000);
  }, []);
  if (timedOut) return <Avatar name={name} />;
  return <SkeletonCircle size="14" />;
};

export default Asset;
