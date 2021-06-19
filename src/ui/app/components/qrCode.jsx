import React from 'react';
import QRCodeStyling from 'qr-code-styling';
import Ada from '../../../assets/img/ada.png';

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

  React.useEffect(() => {
    qrCode.append(ref.current);
  }, []);

  React.useEffect(() => {
    qrCode.update({
      data: value,
    });
  }, [value]);

  return <div ref={ref} />;
};

export default QrCode;
