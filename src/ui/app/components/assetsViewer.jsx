import { Box, SimpleGrid } from '@chakra-ui/layout';
import { Spinner, Text } from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import React from 'react';
import Asset from './asset';
import { Planet } from 'react-kawaii';
import Slider from 'react-leaf-carousel';

const storedAssets = {};

const AssetsViewer = ({ assets }) => {
  const [assetsArray, setAssetsArray] = React.useState(null);
  const ref = React.useRef();
  const createArray = async () => {
    if (!assets) {
      setAssetsArray(null);
      return;
    }
    await new Promise((res, rej) => setTimeout(() => res(), 10));
    const assetsArray = [];
    let i = 0;
    while (true) {
      const sub = assets.slice(i, i + 8);
      if (sub.length <= 0) break;
      assetsArray.push(sub);
      i += 8;
    }
    setAssetsArray(assetsArray);
  };
  React.useEffect(() => {
    createArray();
  }, [assets]);

  React.useEffect(() => {
    return () => {
      setAssetsArray(null);
    };
  }, []);

  return (
    <Box position="relative" zIndex="0">
      {!(assets && assetsArray) ? (
        <Box mt="28" display="flex" alignItems="center" justifyContent="center">
          <Spinner color="teal" speed="0.5s" />
        </Box>
      ) : assetsArray.length <= 0 ? (
        <Box
          mt="16"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          opacity="0.5"
        >
          <Planet size={80} mood="ko" color="#61DDBC" />
          <Box height="2" />
          <Text fontWeight="bold" color="GrayText">
            No Assets
          </Text>
        </Box>
      ) : (
        <>
          <Slider
            prevArrow={
              <ChevronLeftIcon
                zIndex="1"
                color="GrayText"
                position="absolute"
                top="110"
                left="0"
                boxSize="6"
                cursor="pointer"
              />
            }
            nextArrow={
              <ChevronRightIcon
                color="GrayText"
                position="absolute"
                top="110"
                right="0"
                boxSize="6"
                cursor="pointer"
              />
            }
            sidesOpacity={0.1}
            sideSize={0.01}
            slidesToScroll={1}
            slidesToShow={1}
            showSided={false}
            lazyLoad={true}
            swipe={false}
            slidesSpacing="0"
          >
            {assetsArray.map((_asset, index) => (
              <AssetsGrid key={index} assets={_asset} />
            ))}
          </Slider>

          {assetsArray.length >= 2 && (
            <>
              <Box
                width="full"
                position="absolute"
                bottom="-30px"
                color="GrayText"
              >
                <Text fontSize="xs" width="full" textAlign="center">
                  {assets && assets.length} total
                </Text>
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

const AssetsGrid = ({ assets }) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Box width="80%">
        <SimpleGrid columns={4} spacing={4}>
          {assets.map((asset, index) => (
            <Asset
              key={index}
              asset={asset}
              onLoad={(fullAsset) => (storedAssets[fullAsset.unit] = fullAsset)}
              storedAssets={storedAssets}
            />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AssetsViewer;
