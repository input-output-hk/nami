import { Box, Image } from '@chakra-ui/react';
import React from 'react';
import { avatarToImage } from '../../../api/extension';

const AvatarLoader = ({ avatar, width, smallRobot }) => {
  const [loaded, setLoaded] = React.useState('');

  const fetchAvatar = async () => {
    console.log(avatar);
    if (!avatar || avatar === loaded) return;
    setLoaded(Number(avatar) ? avatarToImage(avatar) : avatar);
  };

  React.useEffect(() => {
    fetchAvatar();
  }, [avatar]);
  return (
    <Box
      width={Number(avatar) && smallRobot ? '85%' : width}
      height={Number(avatar) && smallRobot ? '85%' : width}
      rounded={'full'}
      overflow={'hidden'}
      backgroundImage={`url(${loaded})`}
      backgroundRepeat={'no-repeat'}
      backgroundSize={'cover'}
    ></Box>
  );
};

export default AvatarLoader;
