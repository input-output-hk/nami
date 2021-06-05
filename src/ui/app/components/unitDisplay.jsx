import { Box } from '@chakra-ui/layout';
import React from 'react';
import { displayUnit } from '../../../api/extension';

const UnitDisplay = ({ quantity, decimals, symbol, ...props }) => {
  const num = displayUnit(quantity, decimals)
    .toLocaleString('en-EN', { minimumFractionDigits: decimals })
    .split('.')[0];
  const subNum = displayUnit(quantity, decimals)
    .toLocaleString('en-EN', { minimumFractionDigits: decimals })
    .split('.')[1];
  return (
    <Box {...props}>
      {quantity || quantity === 0 ? (
        <>
          {num}.<span style={{ fontSize: '75%' }}>{subNum}</span>{' '}
        </>
      ) : (
        '...'
      )}
      {symbol}
    </Box>
  );
};

export default UnitDisplay;
