import { forwardRef, useCallback, useEffect, useState } from 'react';

import { TextField } from '@mui/material';
import _ from 'lodash';
import { NumericFormat } from 'react-number-format';
import type { AppNumberFieldProps } from './type';

const AppNumberField: React.FC<AppNumberFieldProps> = forwardRef((props, ref) => {
   const {
      onChange,
      value,
      onPressEnter,
      debounceDelay,
      decimalScale,
      isDecimalScale,
      ...numberFieldProps
   } = props;

   const [numberValue, setNumberValue] = useState(value || 0);

   useEffect(() => {
      setNumberValue(value);
   }, [value]);

   const debouceHandleOnChange = useCallback(
      _.debounce((event) => {
         onChange(event);
      }, debounceDelay || 700),
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
         onPressEnter();
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
