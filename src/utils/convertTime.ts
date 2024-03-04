import moment from 'moment-timezone';

export const convertServerTimeToClientTimeZone = (
   serverLatestUpdatedTime: string | number[],
   serverTimeZone: string
) => {
   if (serverLatestUpdatedTime && serverTimeZone) {
      let serverMoment;

      if (Array.isArray(serverLatestUpdatedTime)) {
         serverMoment = moment(serverLatestUpdatedTime.slice(0, 6));
         console.log(serverMoment);
      } else {
         serverMoment = moment(serverLatestUpdatedTime, 'YYYY-MM-DDTHH:mm:ss.SSSSSSSSS');
      }
      const clientTimeZone = moment.tz.guess();
      const convertedTime = serverMoment.tz(serverTimeZone).tz(clientTimeZone);

      return convertedTime.format('HH:mm:ss YYYY-MM-DD');
   }
};
