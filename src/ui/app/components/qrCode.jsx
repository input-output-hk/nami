import React from 'react';
import QRCodeStyling from 'qr-code-styling';
import Ada from '../../../assets/img/ada.png';
import { useColorModeValue } from '@chakra-ui/react';

const qrCode = new QRCodeStyling({
  width: 150,
  height: 150,
  image: Ada,
  dotsOptions: {
    color: '#319795',
    type: 'dots',
  },
  cornersSquareOptions: { type: 'extra-rounded', color: '#DD6B20' },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 8,
  },
});

const QrCode = ({ value }) => {
  const ref = React.useRef(null);
  const bgColor = useColorModeValue('white', '#2D3748');

  React.useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  React.useEffect(() => {
    qrCode.update({
      data: value,
      backgroundOptions: {
        color: bgColor,
      },
    });
  }, [value, bgColor]);

  return <div ref={ref} />;
};

export default QrCode;
