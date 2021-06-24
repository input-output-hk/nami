import { Image } from '@chakra-ui/react';
import React from 'react';
import { avatarToImage } from '../../../api/extension';

const AvatarLoader = ({ avatar, width }) => {
  const [loaded, setLoaded] = React.useState('');

  React.useEffect(() => {
    if (!avatar || avatar === loaded) return;
    setLoaded(avatarToImage(avatar));
  }, [avatar]);
  return <Image draggable={false} width={width} src={loaded} />;
};

export default AvatarLoader;
