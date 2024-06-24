import React from 'react';
import features from '../../assets/features.png';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { Box } from '@chakra-ui/react';
import { ReactComponent as FeaturesImg } from '../../assets/features.svg';

export const NewFeatures = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="New exciting features!"
      description={[
        'Unlock several new features to',
        'enhance your wallet experience',
      ]}
      image={
        <Box>
          {<FeaturesImg width="296px" height="172px" />}
        </Box>
      }
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
