import type { StandardTextFieldProps } from '@mui/material';

export interface AppTextFieldProps extends StandardTextFieldProps {
   generateCode?: boolean;
   tooltip?: string;
   loading?: boolean;
   onGenerateCode?: (event) => void;
   isFocus?: boolean;
   debounceDelay?: number;
}
