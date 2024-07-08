import type { NumberFormatValues, NumericFormatProps } from 'react-number-format';
import type { AppTextFieldProps } from '@/components/App/TextField/type';

export type NumberFormatProps = Omit<
   NumericFormatProps,
   'onChange' | 'fixedDecimalScale' | 'thousandSeparator'
>;

export type TextFieldProps = Pick<
   AppTextFieldProps,
   | 'name'
   | 'label'
   | 'required'
   | 'error'
   | 'helperText'
   | 'InputProps'
   | 'generateCode'
   | 'onGenerateCode'
   | 'disabled'
   | 'loading'
   | 'sx'
>;

export interface AppNumberFieldProps extends NumberFormatProps, TextFieldProps {
   onChange(values: NumberFormatValues): void;
   fixedDecimalScale?: boolean | number;
   thousandSeparator?: boolean | string;
   onPressEnter?(): void;
   debounceDelay?: number;
   isDecimalScale?: boolean;
}
