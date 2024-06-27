import React from 'react';
import backpack from '../../assets/backpack.png';
import { Slide } from '../slide.component';
import { ReactComponent as LaceIcon } from '../../assets/lace-icon.svg';
import { Image } from '@chakra-ui/react';

export const NoWallet = ({ onAction }) => {
  return (
    <Slide
      showTerms
      title="Your Nami wallet evolved"
      image={<Image mb="38px" w="91px" h="126px" src={backpack} />}
      description={['To create or import a new', 'wallet, please proceed at Lace']}
      buttonText="Get started with Lace"
      buttonIcon={LaceIcon}
      onButtonClick={onAction}
      noWallet
    />
  );
};
