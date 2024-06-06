import React from 'react';
import seamless from '../../assets/seamless.png';
import seamlessDark from '../../assets/seamless-dark.png';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';
import { Image, useColorMode } from '@chakra-ui/react';

export const SeamlessUpgrade = ({ onAction }) => {
  const { colorMode } = useColorMode();
  const imageSrc = colorMode === 'light' ? seamless : seamlessDark;
  return (
    <Slide
      showTerms
      title="Seamless wallet upgrade"
      image={<Image mb="60px" w="239px" h="102px" src={imageSrc} />}
      description={[
        'Nami will move your wallets to',
        'Lace extension automatically',
      ]}
      buttonText="Upgrade your wallet"
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
