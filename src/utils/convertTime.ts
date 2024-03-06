import moment from 'moment-timezone';

export const convertServerTimeToClientTimeZone = (
   serverLatestUpdatedTime: string | number[],
   serverTimeZone: string
) => {
   if (serverLatestUpdatedTime && serverTimeZone) {
      let serverMoment;

      if (Array.isArray(serverLatestUpdatedTime)) {
         serverMoment = moment
            .tz(serverLatestUpdatedTime.slice(0, 6), serverTimeZone)
            .subtract(1, 'months');
      } else {
         serverMoment = moment.tz(serverLatestUpdatedTime, serverTimeZone);
      }

      const clientTimeZone = moment.tz.guess();

      const convertedTime = serverMoment.clone().tz(clientTimeZone);

      return convertedTime.format('YYYY-MM-DD HH:mm', convertedTime);
   }
};
