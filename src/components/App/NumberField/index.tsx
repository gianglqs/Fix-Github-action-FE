import { forwardRef, useCallback, useEffect, useState } from 'react';

import { TextField } from '@mui/material';
import _ from 'lodash';
import { NumericFormat } from 'react-number-format';
import type { AppNumberFieldProps } from './type';
import { makeStyles } from '@mui/styles';

const AppNumberField: React.FC<AppNumberFieldProps> = forwardRef((props, ref) => {
   const {
      onChange,
      value,
      onPressEnter,
      debounceDelay,
      decimalScale,
      isDecimalScale,
      max,
      ...numberFieldProps
   } = props;

   const [numberValue, setNumberValue] = useState(value || 0);
   useEffect(() => {
      setNumberValue(value);
   }, [value]);

   const debouceHandleOnChange = useCallback(
      _.debounce((event) => {
         if (event.value !== '.') onChange(event);
      }, debounceDelay || 1),
      [onChange]
   );

   useEffect(() => {
      return () => {
         debouceHandleOnChange.cancel();
      };
   }, [debouceHandleOnChange]);

   const handleOnChange = (event) => {
      const newValue = event.value;
      setNumberValue(newValue);
      debouceHandleOnChange(event);
   };

   const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
         onPressEnter && onPressEnter();
      }
   };

   return (
      <NumericFormat
         {...(numberFieldProps as any)}
         customInput={TextField}
         onValueChange={handleOnChange}
         ref={ref as any}
         allowNegative={false}
         onKeyDown={handleKeyDown}
         format="#### #### #### ####"
         fixedDecimalScale={false}
         decimalScale={isDecimalScale ? decimalScale : 10}
         value={numberValue}
         isAllowed={(value) => {
            const { floatValue } = value;
            return !floatValue || !max || floatValue <= Number(max);
         }}
      />
   );
});

AppNumberField.defaultProps = {
   thousandSeparator: ' ',
   decimalScale: 0,
   fixedDecimalScale: true,
};

export * from './type';
export { AppNumberField };
