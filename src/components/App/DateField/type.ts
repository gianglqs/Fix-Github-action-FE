import type { AppTextFieldProps } from '../TextField/type';

export interface AppDateFieldProps extends Omit<AppTextFieldProps, 'onChange'> {
   onChange?: (event, date: string) => void;
   minDate?: string | Date;
   maxDate?: string | Date;
   disabled?: boolean;
   views: any;
}
