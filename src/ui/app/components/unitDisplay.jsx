import { Box } from '@chakra-ui/layout';
import React from 'react';
import { displayUnit } from '../../../api/extension';

const UnitDisplay = ({ quantity, decimals, symbol, ...props }) => {
  const num = displayUnit(quantity, decimals)
    .toLocaleString('en-EN')
    .split('.')[0];
  const subNum = displayUnit(quantity, decimals)
    .toFixed(decimals)
    .toLocaleString('en-EN')
    .split('.')[1];
  return (
    <Box {...props}>
      {num}.<span style={{ fontSize: '75%' }}>{quantity ? subNum : '...'}</span>{' '}
      {symbol}
    </Box>
  );
};

export default UnitDisplay;
