import { Box, SimpleGrid } from '@chakra-ui/layout';
import { Spinner, Text } from '@chakra-ui/react';
import { ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import React from 'react';
import Asset from './asset';
import Slider from 'react-slick';
import { Planet } from 'react-kawaii';
import AssetPopover from './assetPopover';

const AssetsViewer = ({ assets }) => {
  const [assetsArray, setAssetsArray] = React.useState(null);
  const ref = React.useRef();
  const [slideIndex, setSlideIndex] = React.useState(0);
  React.useEffect(() => {
    if (!assets) {
      setAssetsArray(null);
      setSlideIndex(0);
      return;
    }
    const assetsArray = [];
    let i = 0;
    while (true) {
      const sub = assets.slice(i, i + 8);
      if (sub.length <= 0) break;
      assetsArray.push(sub);
      i += 8;
    }
    setAssetsArray(assetsArray);
  }, [assets]);

  const settings = {
    dots: false,
    lazyLoad: true,
    infinite: true,
    swipeToSlide: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (current, next) => setSlideIndex(next),
  };

  return (
    <Box position="relative">
      {!assetsArray ? (
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
            style={{
              overflowX: 'hidden',
            }}
            ref={(el) => (ref.current = el)}
            {...settings}
          >
            {assetsArray.map((_asset, index) => (
              <AssetsGrid key={index} assets={_asset} />
            ))}
          </Slider>
          {assetsArray.length >= 2 && (
            <>
              <ChevronLeftIcon
                onClick={() => ref.current.slickGoTo(slideIndex - 1)}
                color="GrayText"
                position="absolute"
                top="100"
                left="0"
                boxSize="6"
                cursor="pointer"
              />
              <ChevronRightIcon
                onClick={() => ref.current.slickGoTo(slideIndex + 1)}
                color="GrayText"
                position="absolute"
                top="100"
                right="0"
                boxSize="6"
                cursor="pointer"
              />
              <Box
                width="full"
                position="absolute"
                bottom="-30px"
                color="GrayText"
              >
                <Text width="full" textAlign="center">
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
            <Asset key={index} asset={asset} />
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default AssetsViewer;
