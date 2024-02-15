import { Button } from '@chakra-ui/button';
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Link, Text } from '@chakra-ui/layout';
import React from 'react';
import PrivacyPolicy from '../../../ui/app/components/privacyPolicy';

export const AnalyticsConsentModal = ({ askForConsent, setConsent }) => {
  const privacyPolRef = React.useRef();

  return (
    <>
      <Modal
        size="xs"
        isOpen={askForConsent}
        isCentered
        onClose={() => setConsent(false)}
        blockScrollOnMount={false}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">Legal & Analytics</ModalHeader>
          <ModalBody>
            <Text
              mb="1"
              fontSize="md"
              fontWeight="bold"
              id="terms-of-service-agreement"
            >
              Give us a hand to improve your Nami experience
            </Text>
            <Text fontSize="sm">
              We would like to collect anonymous information from your browser
              extension to help us improve the quality and performance of Nami.
              This may include data about how you use our service, your
              preferences and information about your system. You can always
              opt-out (see the&nbsp;
              <Link
                onClick={() => window.open('https://www.namiwallet.io/')}
                textDecoration="underline"
              >
                FAQ
              </Link>
              &nbsp;for more details). For more information on our privacy
              practices, see our&nbsp;
              <Link
                onClick={() => privacyPolRef.current.openModal()}
                textDecoration="underline"
              >
                Privacy Policy
              </Link>
              .
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={() => setConsent(false)}>
              No thanks
            </Button>
            <Button colorScheme="teal" onClick={() => setConsent(true)}>
              I agree
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PrivacyPolicy ref={privacyPolRef} />
    </>
  );
};
