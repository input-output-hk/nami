import React from 'react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { Box } from '@chakra-ui/react';
import { ReactComponent as FeaturesImg } from '../../../assets/features.svg';

export const Slide3 = ({ onAction, isDismissable, dismissibleSeconds }) => {
  return (
    <Slide
      showTerms
      title="It's time to upgrade your wallet!"
      description="Your Nami wallet is now part of the Lace family"
      image={
        <Box>
          <FeaturesImg width="262px" height="auto" />
        </Box>
      }
      buttonText="Upgrade"
      buttonIcon={Arrow}
      onButtonClick={onAction}
      isDismissable={isDismissable}
      dismissibleSeconds={dismissibleSeconds}
      buttonOrientation="row"
    />
  );
};
