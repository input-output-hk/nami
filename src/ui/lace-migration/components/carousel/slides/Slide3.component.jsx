import React from 'react';
import { Slide } from '../../slide.component';
import { ReactComponent as Arrow } from '../../../assets/arrow.svg';
import { Box } from '@chakra-ui/react';
import { ReactComponent as FeaturesImg } from '../../../assets/features.svg';

export const Slide3 = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="Seamless switch"
      description={[
        "Send all your wallets to Lace's new",
        'Nami Mode with one single click!',
      ]}
      image={
        <Box>
          <FeaturesImg width="296px" height="172px" />
        </Box>
      }
      buttonText="Migrate your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
