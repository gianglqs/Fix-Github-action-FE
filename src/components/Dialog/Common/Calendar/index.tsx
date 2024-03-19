import { useMemo } from 'react';

import _ from 'lodash';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/utils/constant';

import type { DialogCalendarProps } from './type';
import { AppDialog } from '../../Module/AppDialog/AppDialog';
import { DateCalendar } from '@mui/x-date-pickers';

const DialogCalendar: React.FC<DialogCalendarProps> = (props) => {
   const { date, minDate, maxDate, disabled, onChange, onClose, ...dialogProps } = props;
   const { views } = props;

   const formatDate = useMemo(() => {
      if (date) {
         return new Date(date);
      }
      return null;
   }, [date]);

   const formatMinDate = useMemo(() => {
      if (minDate && _.isString(minDate)) {
         return new Date(minDate);
      }
      if (minDate && minDate instanceof Date) {
         return minDate;
      }
      return null;
   }, [minDate]);

   const formatMaxDate = useMemo(() => {
      if (maxDate && _.isString(maxDate)) {
         return new Date(maxDate);
      }
      if (maxDate && maxDate instanceof Date) {
         return maxDate;
      }
      return null;
   }, [maxDate]);

   const handleSelectDate = (date: Date) => {
      const stringDate = format(date, DATE_FORMAT);

      onChange(event, stringDate, date);
      onClose(event, null);
   };

   return (
      <AppDialog maxWidth="xs" onClose={onClose} {...dialogProps}>
         <DateCalendar
            views={views}
            disabled={disabled}
            value={formatDate}
            minDate={formatMinDate}
            maxDate={formatMaxDate}
            onChange={handleSelectDate}
         />
      </AppDialog>
   );
};

DialogCalendar.defaultProps = {
   views: ['day', 'month', 'year'],
   minDate: null,
   maxDate: null,
};

export default DialogCalendar;
