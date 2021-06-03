import { Box, Text } from '@chakra-ui/layout';
import { Tooltip } from '@chakra-ui/tooltip';
import React from 'react';

const Copy = ({ label, copy, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  return (
    <Tooltip isOpen={copied} label={label}>
      <Box
        cursor="pointer"
        onClick={() => {
          navigator.clipboard.writeText(copy);
          setCopied(true);
          setTimeout(() => setCopied(false), 800);
        }}
      >
        {props.children}
      </Box>
    </Tooltip>
  );
};

export default Copy;
