import React from 'react';
import { Box } from '@chakra-ui/react';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { ReactComponent as BackpackImg } from '../../assets/backpack.svg';

export const ItsTimetToUpgrade = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="It's time to upgrade your wallet!"
      image={
        <Box mb={"38px"}>
          {<BackpackImg width="91px" height="126px" />}
        </Box>
      }
      description={['Your Nami wallet is now', 'part of the Lace family']}
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
