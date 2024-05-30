import React, {
   useState,
   useRef,
   useEffect,
   KeyboardEventHandler,
   useMemo,
   isValidElement,
} from 'react';
import { TextField, Autocomplete, Typography, Box, Checkbox } from '@mui/material';
import { makeStyles } from '@mui/styles';
import _ from 'lodash';
import { FormControllerErrorMessage } from '@/components';

const useStyles = makeStyles((theme) => ({
   buttonGroup: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 !important',
   },
   appAutocomplete__chip__container: {
      height: '19px !important',
      fontSize: theme.typography.body2.fontSize,
      backgroundColor: `${theme.palette.grey[200]} !important`,
      borderRadius: '8px !important',
   },
   appAutocomplete__chip__icon: {
      fontSize: '14px !important',
   },
}));

const createOption = (value) => ({
   value: value,
   type: 'create-new',
});

const AppAutocomplete = (props) => {
   const {
      error,
      helperText,
      label,
      required,
      textFieldProps,
      primaryKeyOption,
      options: initialOptions,
      value,
      renderOption,
      multiple,
      isFocus,
      onChange,
      ...autocompleteProps
   } = props;

   const classes = useStyles();
   const focusRef = useRef(null);

   const [isFocusing, setIsFocusing] = useState(false);
   const [inputValue, setInputValue] = useState('');
   const [options, setOptions] = useState(initialOptions);

   const openTooltip = useMemo(() => isFocusing && error, [error, isFocusing]);

   const formatValue = useMemo(() => {
      try {
         if (_.isInteger(value) || _.isString(value)) {
            return _.find(options, (item) => item[primaryKeyOption] === value);
         }
         return value;
      } catch (error) {
         return _.toString(value);
      }
   }, [options, value]);

   const filteredOptions = useMemo(() => {
      if (_.every(options, (op) => _.has(op, 'status'))) {
         return _.filter(options, { status: true });
      }
      return options;
   }, [options]);

   useEffect(() => {
      if (focusRef.current) {
         focusRef.current.focus();
      }
   }, []);

   const isOptionEqualToValue = (option, value) => {
      try {
         if (_.isInteger(option) || _.isString(option)) {
            return option[primaryKeyOption] === value;
         }

         return option[primaryKeyOption] === value[primaryKeyOption];
      } catch {
         return false;
      }
   };

   const renderOptionMultiple = (prop, option, state) => {
      const { selected } = state;

      const desc = renderOption(prop, option, state, null);
      if (isValidElement(desc)) {
         return (
            <Box display="flex" alignItems="center" {...prop}>
               <Checkbox
                  checked={selected}
                  style={{ padding: 0, paddingRight: 8 }}
                  color="primary"
               />
               <span>{desc}</span>
            </Box>
         );
      }
      return (
         <Typography {...prop}>
            <Checkbox checked={selected} style={{ padding: 0, paddingRight: 8 }} color="primary" />
            <span>{desc}</span>
         </Typography>
      );
   };

   const tranformRenderOption = (prop, option, state) => {
      const desc = renderOption(prop, option, state, null);
      if (isValidElement(desc)) {
         return desc;
      }
      return <Typography {...prop}>{desc}</Typography>;
   };

   const getRenderOption = () => {
      if (multiple) {
         return renderOptionMultiple;
      }
      return tranformRenderOption;
   };

   const onHoverField = () => {
      setIsFocusing(true);
   };

   const onLeavingField = () => {
      setIsFocusing(false);
   };

   const handleCreateNew = (inputValue) => {
      if (inputValue) {
         const newOption = createOption(inputValue);

         setOptions((prevOptions) => [...prevOptions, newOption]);
         setInputValue('');
         onChange(null, newOption, 'createOption', undefined);
      }
   };

   const renderInput = (params) => {
      return (
         <TextField
            {...params}
            error={error}
            label={label}
            required={required}
            inputRef={isFocus && focusRef}
            {...textFieldProps}
            sx={{
               zIndex: 100,
               maxHeight: 25,
               '& .MuiInputBase-root': {
                  backgroundColor: '#fff',
               },
            }}
            InputProps={{
               ...params.InputProps,
               ...textFieldProps.InputProps,
            }}
         />
      );
   };

   const filterOptions = (options, { inputValue }) => {
      const filtered = options.filter((option) =>
         option.value.toLowerCase().includes(inputValue.toLowerCase())
      );

      if (inputValue !== '' && !filtered.some((option) => option.value === inputValue)) {
         filtered.push({
            [primaryKeyOption]: `Create new "${inputValue}"`,
         });
      }

      return filtered;
   };

   const handleKeyDown: KeyboardEventHandler = (event) => {
      if (!inputValue) return;
      switch (event.key) {
         case 'Enter':
         case 'Tab':
            handleCreateNew(inputValue);
            event.preventDefault();
      }
   };

   return (
      <FormControllerErrorMessage title={helperText} open={openTooltip}>
         <Autocomplete
            value={formatValue}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
            onMouseOver={onHoverField}
            onMouseLeave={onLeavingField}
            noOptionsText="No result found"
            ChipProps={{
               classes: {
                  root: classes.appAutocomplete__chip__container,
                  deleteIcon: classes.appAutocomplete__chip__icon,
               },
            }}
            isOptionEqualToValue={isOptionEqualToValue}
            multiple={multiple}
            renderInput={renderInput}
            renderOption={getRenderOption()}
            filterOptions={filterOptions}
            options={filteredOptions}
            onChange={(event, newValue, reason, details) => {
               if (!newValue) newValue = {};

               if (newValue && newValue['value']?.includes('Create new')) {
                  handleCreateNew(inputValue);
               } else {
                  onChange(event, newValue, reason, details);
               }
            }}
            onKeyDown={handleKeyDown}
            {...autocompleteProps}
         />
      </FormControllerErrorMessage>
   );
};

AppAutocomplete.defaultProps = {
   primaryKeyOption: 'id',
   textFieldProps: {},
   disableClearable: true,
   renderOption(prop, option) {
      return option?.label;
   },
   getOptionLabel(option) {
      return option.label;
   },
};

export * from './type';
export default AppAutocomplete;
