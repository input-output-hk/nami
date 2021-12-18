import { Box } from '@chakra-ui/layout';
import { Avatar, useColorModeValue, Button, Collapse } from '@chakra-ui/react';
import React from 'react';
import UnitDisplay from './unitDisplay';
import { useHistory } from 'react-router-dom';
import { BsArrowUpRight } from 'react-icons/bs';

const AdaAsset = ({ asset }) => {
  const background = useColorModeValue('gray.100', 'gray.700');
  const [show, setShow] = React.useState(false);
  const history = useHistory();

  return (
    <Box
      display="flex"
      alignItems="center"
      width="90%"
      rounded="xl"
      background={background}
      onClick={() => setShow(!show)}
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
            <Avatar bg="#0033AD" width="full" height="full" name="₳" />
          </Box>

          <Box w={4} />
          <Box
            width="90px"
            className="lineClamp"
            fontWeight="bold"
            overflow="hidden"
          >
            ADA
          </Box>
          <Box w={4} />
          <Box width="120px" textAlign="center">
            <UnitDisplay quantity={asset.quantity} decimals={6} />
          </Box>
        </Box>
        <Box h={2} />
        <Box width="full" display="flex" justifyContent="right">
          <Button
            mr="4"
            background={background == 'gray.100' ? 'gray.200' : 'gray.600'}
            size="xs"
            rightIcon={<BsArrowUpRight />}
            onClick={(e) => {
              history.push('/send');
            }}
          >
            Send
          </Button>
        </Box>
        <Box h={2} />
      </Collapse>
    </Box>
  );
};

export default AdaAsset;
