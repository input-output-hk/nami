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

export const AnalyticsConsentModal = ({
  askForConsent,
  setConsent,
}) => (
  <Modal size="xs" isOpen={askForConsent} isCentered onClose={() => setConsent(false)}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader fontSize="md">Legal & analytics</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text
          mb="1"
          fontSize="md"
          fontWeight="bold"
          id="terms-of-service-agreement"
        >
          Give us a hand to improve your experience
        </Text>
        <Text fontSize="sm">
          By sharing analytics data from your browser, you can help us improve
          the quality and performance of Nami. For more information on our
          privacy practices, please see our&nbsp;
          <Link
            onClick={() =>
              window.open('https://www.lace.io/iog-privacy-policy.pdf')
            }
            textDecoration="underline"
          >
            Privacy Policy
          </Link>
          .
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button
          mr={3}
          variant="ghost"
          onClick={() => setConsent(false)}
        >
          decline
        </Button>
        <Button colorScheme="teal" onClick={() => setConsent(true)}>
          Accept
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
