import { Button } from '@chakra-ui/button';
import { Box, Text } from '@chakra-ui/layout';
import React from 'react';
import { setWhitelisted } from '../../../api/extension';

const Enable = ({ request, controller }) => {
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
      <Box position="absolute" top="24">
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
        <img src={`chrome://favicon/size/16@2x/${request.origin}`} />
        <Box height="4" />
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
            await controller.returnData('CANCEL');
            window.close();
          }}
        >
          Cancel
        </Button>
        <Button
          colorScheme="teal"
          onClick={async () => {
            await setWhitelisted(request.origin);
            await controller.returnData(true);
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
