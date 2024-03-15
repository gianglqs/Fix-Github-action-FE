import { useState } from 'react';

import { InputAdornment } from '@mui/material';
import { AppTextField, CalendarIcon } from '@/components';

import _ from 'lodash';

import type { AppDateFieldProps } from './type';
import formatDateInput from '@/utils/formatDateInput';
import DialogCalendar from '@/components/Dialog/Common/Calendar';

const AppDateField: React.FC<AppDateFieldProps> = (props) => {
   const { value, onChange, disabled, minDate, maxDate, views, ...textFieldProps } = props;

   const [openCalendar, setOpenCalendar] = useState(false);

   const handleChangeDate = (event) => {
      const { value } = event.target;
      onChange(event, value);
   };

   const focusOutDatePicker = (event) => {
      const { isValidDate, formatDate } = formatDateInput(event.target.value);
      onChange(event, isValidDate ? formatDate : null);
   };

   const handleOpenCalendar = () => {
      setOpenCalendar(true);
   };

   const handleCloseCalendar = () => {
      setOpenCalendar(false);
   };

   const handleSelectDate = (event, stringDate: string) => {
      onChange(event, stringDate);
   };

   return (
      <>
         <AppTextField
            {...textFieldProps}
            value={_.toString(value)}
            onChange={handleChangeDate}
            onBlur={focusOutDatePicker}
            disabled={disabled}
            InputProps={{
               endAdornment: (
                  <InputAdornment position="start">
                     <CalendarIcon onClick={handleOpenCalendar} />
                  </InputAdornment>
               ),
            }}
         />
         <DialogCalendar
            views={views}
            disabled={disabled}
            minDate={minDate}
            maxDate={maxDate}
            date={value as string}
            open={openCalendar}
            onClose={handleCloseCalendar}
            onChange={handleSelectDate}
         />
      </>
   );
};

export default AppDateField;
