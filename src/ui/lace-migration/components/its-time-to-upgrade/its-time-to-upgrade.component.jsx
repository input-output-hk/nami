import React from 'react';
import backpack from '../../assets/backpack.png';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { Image } from '@chakra-ui/react';

export const ItsTimetToUpgrade = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="It's time to upgrade your wallet!"
      image={<Image mb="38px" w="91px" h="126px" src={backpack} />}
      description={['Your Nami wallet is now', 'part of the Lace family']}
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
