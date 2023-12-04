import { Box } from '@chakra-ui/react';
import React from 'react';
import { displayUnit } from '../../../api/extension';

const hideZero = (str) =>
  str[str.length - 1] == 0 ? hideZero(str.slice(0, -1)) : str;

const UnitDisplay = ({ quantity, decimals, symbol, hide, ...props }) => {
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
          {num}
          {(hide && hideZero(subNum).length <= 0) || decimals == 0 ? '' : '.'}
          <span style={{ fontSize: '75%' }}>
            {hide ? hideZero(subNum) : subNum}
          </span>{' '}
        </>
      ) : (
        '... '
      )}
      {symbol}
    </Box>
  );
};

export default UnitDisplay;
