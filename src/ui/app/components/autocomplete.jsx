import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
  List,
  ListItem,
} from '@chakra-ui/react';
import { matchSorter } from 'match-sorter';
import {
  CheckCircleIcon,
  ChevronDownIcon,
  SmallAddIcon,
} from '@chakra-ui/icons';

const Autocomplete = ({
  options,
  result,
  setResult,
  placeholder,
  renderBadge,
  inputName,
  inputId,
  bgHoverColor,
  createText,
  allowCreation,
  notFoundText,
  isInvalid,
  width,
  ...props
}) => {
  const [optionsCopy, setOptionsCopy] = useState(options);
  const [partialResult, setPartialResult] = useState();
  const [displayOptions, setDisplayOptions] = useState(false);
  const [inputValue, setInputValue] = useState();
  const inputRef = useRef(null);

  const filterOptions = (inputValue) => {
    if (inputValue) {
      setDisplayOptions(true);
      setPartialResult(
        matchSorter(optionsCopy, inputValue, { keys: ['label', 'value'] })
      );
      setInputValue(inputValue);
    } else {
      setDisplayOptions(false);
    }
  };

  const selectOption = (option) => {
    if (result.includes(option)) {
      setResult([
        ...result.filter(
          (existingOption) => existingOption.value !== option.value
        ),
      ]);
    } else {
      setResult([option, ...result]);
    }
  };

  const isOptionSelected = (option) => {
    return (
      result.filter((selectedOption) => selectedOption.value === option.value)
        .length > 0
    );
  };

  const createOption = () => {
    if (inputValue && allowCreation) {
      const newOption = {
        label: inputValue,
        value: inputValue,
      };
      setOptionsCopy([newOption, ...optionsCopy]);
      selectOption(newOption);
      setDisplayOptions(false);
      if (inputRef && inputRef.current !== null) {
        inputRef.current.value = '';
      }
    }
  };

  const selectOptionFromList = (option) => {
    selectOption(option);
    setDisplayOptions(false);
    if (inputRef && inputRef.current !== null) {
      inputRef.current.value = '';
    }
  };

  const renderCheckIcon = (option) => {
    if (isOptionSelected(option)) {
      if (props.renderCheckIcon) {
        return props.renderCheckIcon;
      } else {
        return <CheckCircleIcon color="green.500" mr={2} />;
      }
    }
    return null;
  };

  const renderCreateIcon = () => {
    if (props.renderCreateIcon) {
      return props.renderCreateIcon;
    } else {
      return <SmallAddIcon color="green.500" mr={2} />;
    }
  };

  return (
    <Box data-testid="simple-autocomplete" width={width}>
      <InputGroup>
        <Input
          name={inputName}
          id={inputId}
          placeholder={placeholder}
          onChange={(e) => filterOptions(e.currentTarget.value)}
          ref={inputRef}
          isInvalid={isInvalid}
        />
        <InputRightElement
          children={<IconButton icon={<ChevronDownIcon />} />}
        />
      </InputGroup>

      {displayOptions && (
        <List
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          boxShadow="6px 5px 8px rgba(0,50,30,0.02)"
          mt={2}
        >
          {partialResult?.map((option) => {
            return (
              <ListItem
                key={option.value}
                _hover={{ bg: bgHoverColor || 'gray.100' }}
                my={1}
                p={2}
                cursor="pointer"
                onClick={() => selectOptionFromList(option)}
              >
                <Flex align="center">
                  {renderCheckIcon(option)}
                  {option.label}
                </Flex>
              </ListItem>
            );
          })}
          {!partialResult?.length && allowCreation && (
            <ListItem
              _hover={{ bg: bgHoverColor || 'gray.100' }}
              my={1}
              p={2}
              cursor="pointer"
              data-testid="create-option"
              onClick={() => createOption()}
            >
              <Flex align="center">
                {renderCreateIcon()}
                {createText}
              </Flex>
            </ListItem>
          )}
          {!partialResult?.length && !allowCreation && (
            <ListItem my={1} p={2} data-testid="not-found">
              <Flex align="center">{notFoundText}</Flex>
            </ListItem>
          )}
        </List>
      )}
    </Box>
  );
};

Autocomplete.defaultProps = {
  notFoundText: 'Not found',
  allowCreation: true,
  createText: 'Create option',
};

export default Autocomplete;
