import React from 'react';
import { Slide } from '../slide.component';
import { ReactComponent as LaceIcon } from '../../assets/lace-icon.svg';
import { ReactComponent as BackpackImg } from '../../assets/backpack.svg';
import { Box } from '@chakra-ui/react';

export const NoWallet = ({ onAction, isDismissable, dismissibleSeconds }) => (
  <Slide
    showTerms
    title="Your Nami wallet has evolved!"
    image={
      <Box mb={'38px'}>
        <BackpackImg width="91px" height="126px" />
      </Box>
    }
    description={
      'To create or import a wallet, please proceed using the Lace Extension'
    }
    buttonText="Get started with Lace Wallet"
    buttonIcon={LaceIcon}
    onButtonClick={onAction}
    isDismissable={isDismissable}
    dismissibleSeconds={dismissibleSeconds}
  />
);
