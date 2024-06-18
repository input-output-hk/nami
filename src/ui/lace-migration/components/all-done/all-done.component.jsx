import React from 'react';
import { Image, useColorMode } from '@chakra-ui/react';
import done from '../../assets/done.png';
import doneDark from '../../assets/done-dark.png';
import { Slide } from '../slide.component';
import { ReactComponent as Arrow } from '../../assets/arrow.svg';

export const AllDone = ({ isLaceInstalled, onAction }) => {
  const { colorMode } = useColorMode();
  const imageSrc = colorMode === 'light' ? done : doneDark;
  return (
    <Slide
      title="All done!"
      image={<Image mb="50px" w="98px" h="98px" src={imageSrc} />}
      description={[
        'From this moment, please use',
        'the Lace extension to access',
        'your upgraded wallet',
      ]}
      buttonText={isLaceInstalled ? 'Open Lace' : 'Download Lace'}
      buttonIcon={Arrow}
      onButtonClick={onAction}
    />
  );
};
