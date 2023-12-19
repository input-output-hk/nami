import React from 'react';
import {
  Box,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { Scrollbars } from './scrollbar';

const PrivacyPolicy = React.forwardRef((props, ref) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  React.useImperativeHandle(ref, () => ({
    openModal() {
      onOpen();
    },
    closeModal() {
      onClose();
    },
  }));
  return (
    <Modal size="xs" isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalHeader fontSize="md">Privacy Policy</ModalHeader>

        <ModalBody pr="0.5">
          <Scrollbars style={{ width: '100%', height: '400px' }}>
            <Box width="92%">
              <Text
                mb="1"
                fontSize="md"
                fontWeight="bold"
                id="terms-of-service-agreement"
              >
                Privacy Policy
              </Text>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Praesent semper feugiat nibh sed. Odio euismod lacinia at quis
                risus. Id volutpat lacus laoreet non curabitur gravida arcu ac
                tortor. Pretium viverra suspendisse potenti nullam ac tortor
                vitae. Massa sapien faucibus et molestie ac feugiat sed lectus
                vestibulum. Diam quis enim lobortis scelerisque fermentum dui
                faucibus in ornare. At auctor urna nunc id cursus metus aliquam.
                Quam nulla porttitor massa id neque. Arcu odio ut sem nulla
                pharetra diam sit amet. Erat imperdiet sed euismod nisi porta.
              </p>

              <p>
                Amet consectetur adipiscing elit duis tristique sollicitudin
                nibh sit. Porttitor lacus luctus accumsan tortor. Mauris nunc
                congue nisi vitae. In vitae turpis massa sed elementum tempus.
                Ut porttitor leo a diam sollicitudin tempor id. Condimentum
                vitae sapien pellentesque habitant. Est velit egestas dui id
                ornare arcu. Egestas maecenas pharetra convallis posuere morbi
                leo. Nisl condimentum id venenatis a condimentum vitae sapien
                pellentesque habitant. Cursus vitae congue mauris rhoncus
                aenean. Lacus suspendisse faucibus interdum posuere lorem ipsum
                dolor sit amet. Sodales neque sodales ut etiam sit amet nisl.
                Morbi quis commodo odio aenean sed. Pharetra vel turpis nunc
                eget. Sed adipiscing diam donec adipiscing tristique risus nec
                feugiat in.
              </p>

              <p>
                Eget nunc lobortis mattis aliquam faucibus purus in massa. Nunc
                faucibus a pellentesque sit amet porttitor eget. Maecenas
                ultricies mi eget mauris pharetra. Rhoncus urna neque viverra
                justo nec ultrices dui sapien eget. Id volutpat lacus laoreet
                non. Volutpat sed cras ornare arcu dui vivamus arcu. Facilisis
                volutpat est velit egestas dui id. Ultricies mi quis hendrerit
                dolor. Odio morbi quis commodo odio aenean sed adipiscing diam
                donec. Urna molestie at elementum eu facilisis. Tincidunt nunc
                pulvinar sapien et ligula ullamcorper malesuada proin. Vitae
                elementum curabitur vitae nunc. Eget mauris pharetra et ultrices
                neque ornare. Nulla facilisi etiam dignissim diam. Amet risus
                nullam eget felis eget nunc lobortis. Vivamus arcu felis
                bibendum ut tristique et egestas. Vitae justo eget magna
                fermentum iaculis eu non.
              </p>

              <p>
                Massa placerat duis ultricies lacus sed. Ultricies lacus sed
                turpis tincidunt id aliquet risus feugiat in. Erat imperdiet sed
                euismod nisi porta lorem mollis aliquam. Dictum non consectetur
                a erat nam at lectus urna duis. Quam pellentesque nec nam
                aliquam sem et. Eros donec ac odio tempor. Sem viverra aliquet
                eget sit amet. Semper risus in hendrerit gravida rutrum quisque
                non. Cras fermentum odio eu feugiat pretium nibh ipsum
                consequat. Elit scelerisque mauris pellentesque pulvinar
                pellentesque habitant. Nulla facilisi etiam dignissim diam quis
                enim lobortis. Sed nisi lacus sed viverra tellus in. Dictumst
                vestibulum rhoncus est pellentesque elit ullamcorper dignissim
                cras tincidunt. Dolor morbi non arcu risus quis varius quam
                quisque id. Integer enim neque volutpat ac tincidunt.
                Ullamcorper malesuada proin libero nunc. Varius vel pharetra vel
                turpis nunc eget lorem dolor sed. Ullamcorper velit sed
                ullamcorper morbi tincidunt ornare massa eget egestas.
              </p>

              <p>
                Porta nibh venenatis cras sed felis eget velit aliquet sagittis.
                Augue ut lectus arcu bibendum at. Amet luctus venenatis lectus
                magna. Pharetra vel turpis nunc eget. Ligula ullamcorper
                malesuada proin libero nunc. Ullamcorper malesuada proin libero
                nunc consequat interdum. Ac placerat vestibulum lectus mauris.
                Facilisis sed odio morbi quis commodo odio aenean. Scelerisque
                eu ultrices vitae auctor eu augue ut lectus arcu. Consectetur
                adipiscing elit ut aliquam purus. Risus sed vulputate odio ut
                enim blandit volutpat maecenas. Mauris cursus mattis molestie a
                iaculis at erat pellentesque adipiscing. Id venenatis a
                condimentum vitae sapien. Dapibus ultrices in iaculis nunc sed
                augue lacus viverra.
              </p>
              <Box h="2" />
            </Box>
          </Scrollbars>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

export default PrivacyPolicy;
