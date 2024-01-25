import React from 'react';
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Scrollbars } from './scrollbar';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import Asset from './asset';

const AssetsModal = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [data, setData] = React.useState({
    title: '',
    assets: [],
    background: '',
    color: 'inherit',
  });
  const background = useColorModeValue('white', 'gray.800');

  const abs = (big) => {
    return big < 0 ? BigInt(big) * BigInt(-1) : big;
  };

  React.useImperativeHandle(ref, () => ({
    openModal(data) {
      setData(data);
      onOpen();
    },
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      blockScrollOnMount={false}
    >
      <ModalContent
        m={0}
        rounded="none"
        overflow={'hidden'}
        background={background}
      >
        <ModalBody p={0}>
          <Scrollbars style={{ width: '100%', height: '88vh' }} autoHide>
            <Box
              width={'full'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
            >
              <Box h={8} />
              <Box
                fontSize={'xl'}
                fontWeight={'bold'}
                maxWidth={'240px'}
                textAlign={'center'}
              >
                {data.title}
              </Box>
              <Box h={6} />
              {data.assets.map((asset, index) => {
                asset = {
                  ...asset,
                  quantity: abs(asset.quantity).toString(),
                };
                return (
                  <Box key={index} width="full" px={4} my={2}>
                    <LazyLoadComponent>
                      <Box
                        width={'full'}
                        display={'flex'}
                        alignItems={'center'}
                        justifyContent={'center'}
                        key={index}
                      >
                        <Asset
                          asset={asset}
                          background={data.background}
                          color={data.color}
                        />
                      </Box>
                    </LazyLoadComponent>
                  </Box>
                );
              })}
              <Box
                position={'fixed'}
                bottom={0}
                width={'full'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <Box
                  width={'full'}
                  height={'12vh'}
                  background={background}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Button onClick={onClose} width={'180px'}>
                    Back
                  </Button>
                </Box>
              </Box>
            </Box>
          </Scrollbars>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default AssetsModal;
