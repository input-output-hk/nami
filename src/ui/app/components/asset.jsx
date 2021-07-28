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
import { blockfrostRequest, linkToSrc } from '../../../api/util';
import provider from '../../../config/provider';
import AssetPopover from './assetPopover';

const useIsMounted = () => {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => (isMounted.current = false);
  }, []);
  return isMounted;
};

function timeout(ms, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('TIMEOUT'));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((reason) => {
        clearTimeout(timer);
        reject(reason);
      });
  });
}

const Asset = ({ asset, onLoad, storedAssets }) => {
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
        linkToSrc(result.onchain_metadata.image)) ||
      (result.metadata && linkToSrc(result.metadata.logo, true)) ||
      '';

    if (image && image.startsWith('https://')) {
      if (!isMounted.current) return;
      setToken({ displayName: name, ...asset, image: 'LOADING' });
      try {
        image = await timeout(
          6000,
          fetch(image)
            .then((res) => res.blob())
            .then((image) => URL.createObjectURL(image))
        );
      } catch (e) {
        image = 'FAILED';
      }
    }
    onLoad({
      displayName: name,
      image,
      ...asset,
    });
    if (!isMounted.current) return;
    setToken({
      displayName: name,
      image,
      ...asset,
    });
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
              {token.image === 'LOADING' ? (
                <SkeletonCircle size="14" />
              ) : (
                <Image
                  width="full"
                  rounded="sm"
                  src={token.image}
                  fallback={<Fallback name={token.name} />}
                />
              )}
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
  const [wait, setWait] = React.useState(true);
  React.useEffect(() => {
    setTimeout(() => setWait(false), 100);
  });
  return !wait && <Avatar name={name} />;
};

export default Asset;
