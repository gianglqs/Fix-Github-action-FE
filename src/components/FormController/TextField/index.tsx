import { forwardRef } from 'react';
import { useController } from 'react-hook-form';

import { AppTextField } from '@/components/index';
import _ from 'lodash';

import type { ControlledTextFieldProps } from './type';

const FormControlledTextField = forwardRef<any, ControlledTextFieldProps>((props, ref) => {
   const {
      control,
      name,
      defaultValue,
      rules,
      transformValue,
      limitText,
      disabled,
      ...textFieldProps
   } = props;

   const {
      field: { onChange: onChangeController, value, ...inputProps },
      fieldState: { invalid, error },
   } = useController({
      name,
      rules,
      defaultValue,
      control,
   });

   const onChangeValue = (event) => {
      if (disabled) {
         return;
      }
      const { value } = event.target;
      const transformVal = transformValue(value);
      if (limitText && _.size(value) > limitText) {
         return;
      }
      onChangeController(transformVal);
   };

   return (
      <AppTextField
         {...inputProps}
         {...(textFieldProps as any)}
         ref={ref}
         disabled={disabled}
         name={name}
         onChange={onChangeValue}
         error={Boolean(invalid)}
         helperText={error?.message}
         value={_.toString(value)}
         debounceDelay={0}
      />
   );
});

FormControlledTextField.defaultProps = {
   rules: {},
   transformValue: (value) => value,
   limitText: null,
};

export default FormControlledTextField;
