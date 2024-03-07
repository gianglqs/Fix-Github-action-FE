import { forwardRef } from 'react';

import { AppTextField } from '@/components';

import type { AppNumberFieldProps } from './type';
import { NumericFormat } from 'react-number-format';
import { truncate } from 'fs';

const AppNumberField: React.FC<AppNumberFieldProps> = forwardRef((props, ref) => {
   const { onChange, ...numberFieldProps } = props;

   return (
      <NumericFormat
         {...(numberFieldProps as any)}
         customInput={AppTextField}
         onValueChange={onChange}
         ref={ref as any}
         allowNegative={true}
         format="#### #### #### ####"
         fixedDecimalScale={true}
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
