import React from 'react';
import { Image, useColorMode } from '@chakra-ui/react';
import { Slide } from '../slide.component';
import pending from '../../assets/pending.png';
import pendingDark from '../../assets/pending-dark.png';
import { ReactComponent as Download } from '../../assets/download.svg';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';

export const AlmostThere = ({ isLaceInstalled, onAction }) => {
  const { colorMode } = useColorMode();
  const imageSrc = colorMode === 'light' ? pending : pendingDark;
  return (
    <Slide
      showTerms
      title="Almost there..."
      image={<Image mb="60px" w="98px" h="98px" src={imageSrc} />}
      description={
        isLaceInstalled
          ? ['Please open Lace', 'extension to proceed']
          : ['Please download Lace', 'extension to proceed']
      }
      buttonText={isLaceInstalled ? 'Open Lace' : 'Download Lace'}
      buttonIcon={isLaceInstalled ? Arrow : Download}
      onButtonClick={onAction}
    />
  );
};
