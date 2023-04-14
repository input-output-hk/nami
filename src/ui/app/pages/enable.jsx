import { Button } from '@chakra-ui/button';
import { CheckIcon } from '@chakra-ui/icons';
import { Box, Text } from '@chakra-ui/layout';
import { Image, useColorModeValue } from '@chakra-ui/react';
import React from 'react';
import { setWhitelisted } from '../../../api/extension';
import { APIError } from '../../../config/config';

import Account from '../components/account';

const Enable = ({ request, controller }) => {
  const background = useColorModeValue('gray.100', 'gray.700');
  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      flexDirection="column"
      position="relative"
    >
      <Account />
      <Box h={14} />
      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        justifyContent="center"
      >
        <Box
          width={10}
          height={10}
          background={background}
          rounded={'xl'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Image
            draggable={false}
            width={6}
            height={6}
            src={`chrome://favicon/size/16@2x/${request.origin}`}
          />
        </Box>
        <Box height="3" />
        <Text fontWeight="bold">{request.origin.split('//')[1]}</Text>
        <Box h={14} />
        <Box>This app would like to:</Box>
        <Box h={4} />
        <Box
          p={6}
          background={background}
          rounded="xl"
          display={'flex'}
          justifyContent={'center'}
          flexDirection={'column'}
        >
          <Box display={'flex'} alignItems={'center'}>
            <CheckIcon mr="3" color={'teal'} boxSize={4} />{' '}
            <Box fontWeight={'bold'}>View your balance and addresses</Box>
          </Box>
          <Box h={4} />
          <Box display={'flex'} alignItems={'center'}>
            <CheckIcon mr="3" color={'teal'} boxSize={4} />{' '}
            <Box fontWeight={'bold'}>Request approval for transactions</Box>
          </Box>
        </Box>
        <Box h={6} />
        <Box color={'GrayText'}>Only connect with sites you trust</Box>
      </Box>
      <Box
        position="absolute"
        width="full"
        bottom="3"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Button
          height={'50px'}
          width={'180px'}
          onClick={async () => {
            await controller.returnData({ error: APIError.Refused });
            window.close();
          }}
        >
          Cancel
        </Button>
        <Box w={3} />
        <Button
          height={'50px'}
          width={'180px'}
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
