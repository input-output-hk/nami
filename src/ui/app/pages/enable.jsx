import { Button } from '@chakra-ui/button';
import { Box, Text } from '@chakra-ui/layout';
import { Image, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { setWhitelisted } from '../../../api/extension';
import { APIError } from '../../../config/config';

import BannerWhite from '../../../assets/img/bannerWhite.svg';
import BannerBlack from '../../../assets/img/bannerBlack.svg';

const Enable = ({ request, controller }) => {
  const Banner = useColorModeValue(BannerBlack, BannerWhite);
  return (
    <Box
      height="100vh"
      width="full"
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      position="relative"
    >
      <Box position="absolute" top="9">
        <Image draggable={false} width="85px" src={Banner} />
      </Box>
      <Box position="absolute" top="180px">
        <Text fontSize="2xl" fontWeight="bold">
          CONNECT
        </Text>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
      >
        <Image src={`chrome://favicon/size/16@2x/${request.origin}`} />
        <Box height="3" />
        <Text fontWeight="bold">{request.origin}</Text>
      </Box>
      <Box
        position="absolute"
        width="full"
        bottom="14"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Button
          mr={3}
          variant="ghost"
          onClick={async () => {
            await controller.returnData({ error: APIError.Refused });
            window.close();
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme="teal"
          onClick={async () => {
            await setWhitelisted(request.origin);
            await controller.returnData({ data: true });
            window.close();
          }}
        >
          Access
        </Button>
      </Box>
    </Box>
  );
};

export default Enable;
