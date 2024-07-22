import React from 'react';
import { Slide } from '../slide.component';
import { ReactComponent as LaceIcon } from '../../assets/lace-icon.svg';
import { ReactComponent as BackpackImg } from '../../assets/backpack.svg';
import { Box } from '@chakra-ui/react';

export const NoWallet = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="Your Nami wallet has evolved!"
      image={
        <Box mb={'38px'}>
          <BackpackImg width="91px" height="126px" />
        </Box>
      }
      description={[
        'To create or import a wallet,',
        'please proceed using',
        'the Lace extension',
      ]}
      buttonText="Get started with Lace"
      buttonIcon={LaceIcon}
      onButtonClick={onAction}
      noWallet
    />
  );
};
