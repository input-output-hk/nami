import React from 'react';
import features from '../../assets/features.png';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { Image } from '@chakra-ui/react';

export const NewFeatures = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="New exciting features!"
      image={<Image w="296px" h="172px" src={features} />}
      description={[
        'Unlock several new features to',
        'enhance your wallet experience',
      ]}
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
