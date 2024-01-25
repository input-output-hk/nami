import { Button } from '@chakra-ui/button';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/modal';
import { Checkbox } from '@chakra-ui/checkbox';
import { Link, Text, Box } from '@chakra-ui/layout';
import React, { useRef } from 'react';
import PrivacyPolicy from '../../../ui/app/components/privacyPolicy';
import TermsOfUse from '../../../ui/app/components/termsOfUse';
import { useAcceptDocs } from '../hooks';

interface Props {
  onContinue: () => void;
}

export const TermsAndPrivacyModal = ({ onContinue }: Props) => {
  const termsRef = useRef<{ openModal: () => void }>();
  const privacyPolicyRef = useRef<{ openModal: () => void }>();
  const { accepted, setAccepted } = useAcceptDocs();

  return (
    <>
      <Modal
        size="xs"
        isOpen
        isCentered
        onClose={() => void 0}
        blockScrollOnMount={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="md">
            Terms of use and Privacy Policy
          </ModalHeader>
          <ModalBody>
            <Box display="flex" flexDirection="column">
              <Text mb="2">
                The terms of use and privacy policy have been updated.
              </Text>
              <Box display="flex" mb="2">
                <Checkbox onChange={(e) => setAccepted(e.target.checked)} />
                <Box display="inline" ml="2">
                  <Text fontWeight={600}>
                    I read and accepted the{' '}
                    <Link
                      onClick={() => termsRef.current?.openModal()}
                      textDecoration="underline"
                    >
                      Terms of use
                    </Link>
                    <Text display="inline"> and </Text>
                    <Link
                      onClick={() => privacyPolicyRef.current?.openModal()}
                      textDecoration="underline"
                    >
                      Privacy Policy
                    </Link>
                  </Text>
                </Box>
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button
              isDisabled={!accepted}
              colorScheme="teal"
              onClick={onContinue}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PrivacyPolicy ref={privacyPolicyRef} />
      <TermsOfUse ref={termsRef} />
    </>
  );
};
