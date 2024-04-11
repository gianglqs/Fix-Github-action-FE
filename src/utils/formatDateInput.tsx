import _ from 'lodash';

export const formatEuropeDate = (date: string) => {
   if (date.length === 0) {
      return null;
   }
   const currentDate = new Date();
   let [year, month, day] = date.split('-');
   if (year.length === 1 || year.length === 2) {
      month = year;
      year = currentDate.getFullYear().toString();
   }
   month = month
      ? month.padStart(2, '0')
      : (currentDate.getMonth() + 1).toString().padStart(2, '0');
   day = day ? day.padStart(2, '0') : currentDate.getDate().toString().padStart(2, '0');
   return `${year}-${month}-${day}`;
};

export const formatAsiaDate = (date: string, symbol: '.' | '/') => {
   if (date.length === 0) {
      return null;
   }
   const currentDate = new Date();
   let [day, month, year] = date.split(symbol);
   day = day.padStart(2, '0');
   month = month
      ? month.padStart(2, '0')
      : (currentDate.getMonth() + 1).toString().padStart(2, '0');
   year = year ? year.padStart(4, '0') : currentDate.getFullYear().toString().padStart(4, '0');
   return `${year}-${month}-${day}`;
};

export const checkValidDateWithRegex = (date: string) => {
   if (date === null) {
      return true;
   } else {
      const regEx = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
      return date.match(regEx) != null;
   }
};

const formatDateInput = (value: string) => {
   let formatDate = '';
   if (_.isNil(value)) formatDate = '';
   else if (value.includes('.')) {
      formatDate = formatAsiaDate(value, '.');
   } else if (value.includes('/')) {
      formatDate = formatAsiaDate(value, '/');
   } else {
      formatDate = formatEuropeDate(value);
   }
   const isValidDate = checkValidDateWithRegex(formatDate);
   return { isValidDate, formatDate };
};

export function formatDate(date): string {
   const day = date.getDate().toString().padStart(2, '0');
   const month = (date.getMonth() + 1).toString().padStart(2, '0');
   const year = date.getFullYear();
   return `${year}-${month}-${day}`;
}

export default formatDateInput;
