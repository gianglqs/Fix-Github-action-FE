import { AppDialogProps } from '../../Module/AppDialog/type';

export interface DialogCalendarProps extends Omit<AppDialogProps, 'onChange'> {
   date: string;
   disabled?: boolean;
   onChange: (event, stringDate: string, date: Date) => void;
   minDate?: Date | string;
   maxDate?: Date | string;
   views: any;
   hiddenButtonOk?: boolean;
}
