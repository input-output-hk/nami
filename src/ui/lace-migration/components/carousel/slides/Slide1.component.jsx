import React from 'react';
import { Box } from '@chakra-ui/react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { ReactComponent as BackpackImg } from '../../../assets/backpack.svg';

export const Slide1 = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="It's time to migrate your wallet!"
      image={
        <Box mb={'20px'}>
          <BackpackImg width="91px" height="126px" />
        </Box>
      }
      description={[
        'The Nami Wallet is now part of the',
        'IOG family and integrated into Lace.',
        'Click ‘Migrate your wallet‘',
        'to begin the process',
      ]}
      buttonText="Migrate your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
