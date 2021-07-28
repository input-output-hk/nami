import { SmallCloseIcon } from '@chakra-ui/icons';
import { Box } from '@chakra-ui/layout';
import {
  Avatar,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SkeletonCircle,
} from '@chakra-ui/react';
import React from 'react';
import { toUnit } from '../../../api/extension';
import { blockfrostRequest, linkToSrc } from '../../../api/util';
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

const AssetBadge = ({ asset, onRemove, onInput, onLoad }) => {
  const isMounted = useIsMounted();
  const [initialWidth, setInitialWidth] = React.useState(
    BigInt(asset.quantity) <= 1 ? 60 : 85
  );
  const [width, setWidth] = React.useState(initialWidth);
  const [token, setToken] = React.useState(null);

  const fetchMetadata = async () => {
    if (asset && asset.loaded) return;
    const result = await blockfrostRequest(`/assets/${asset.unit}`);
    const name =
      (result.onchain_metadata && result.onchain_metadata.name) ||
      (result.metadata && result.metadata.name) ||
      asset.name;
    let image =
      (result.onchain_metadata &&
        result.onchain_metadata.image &&
        linkToSrc(result.onchain_metadata.image)) ||
      (result.metadata && linkToSrc(result.metadata.logo)) ||
      '';

    if (image && image.startsWith('https://')) {
      if (!isMounted.current) return;
      setToken({ displayName: name, ...asset, image: 'LOADING' });
      try {
        console.log(image);
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
    if (!isMounted.current) return;
    setToken({
      displayName: name,
      image,
      ...asset,
    });
  };

  React.useEffect(() => {
    fetchMetadata();
    const initialWidth = BigInt(asset.quantity) <= 1 ? 60 : 85;
    setInitialWidth(initialWidth);
    setWidth(initialWidth);
    if (BigInt(asset.quantity) <= 1) onInput(asset.quantity);
  }, [asset]);
  return (
    <Box m="0.5">
      <InputGroup size="sm">
        <InputLeftElement
          rounded="lg"
          children={
            <Box
              userSelect="none"
              width="6"
              height="6"
              rounded="full"
              overflow="hidden"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {!token ? (
                <SkeletonCircle size="5" />
              ) : (
                <AssetPopover asset={token}>
                  <Button
                    style={{
                      all: 'revert',
                      margin: 0,
                      padding: 0,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {token.image === 'LOADING' ? (
                      <SkeletonCircle size="5" />
                    ) : (
                      <Image
                        width="full"
                        rounded="sm"
                        src={token.image}
                        fallback={<Fallback name={token.name} />}
                      />
                    )}
                  </Button>
                </AssetPopover>
              )}
            </Box>
          }
        />
        <Input
          width={`${width}px`}
          maxWidth="130px"
          isReadOnly={BigInt(asset.quantity) <= 1}
          value={asset.input || ''}
          fontSize="xs"
          rounded="lg"
          placeholder="Qty"
          onInput={(e) => {
            if (!e.target.value.match(/^\d*[0-9]\d*$/) && e.target.value)
              return;
            // if (!e.target.value.match(/^\d*[0-9,.]\d*$/) && e.target.value) return; -- decimals not supported yet for assets
            setWidth(initialWidth + e.target.value.length * 4);
            onInput(e.target.value);
          }}
          isInvalid={
            asset.input &&
            (BigInt(toUnit(asset.input, 0)) > BigInt(asset.quantity) ||
              BigInt(toUnit(asset.input, 0)) <= 0)
          }
        />
        <InputRightElement
          rounded="lg"
          children={
            <SmallCloseIcon cursor="pointer" onClick={() => onRemove()} />
          }
        />
      </InputGroup>
    </Box>
  );
};

const Fallback = ({ name }) => {
  const [wait, setWait] = React.useState(true);
  React.useEffect(() => {
    setTimeout(() => setWait(false), 100);
  });
  return !wait && <Avatar size="xs" name={name} />;
};

export default AssetBadge;
