export const convertCurrencyOfDataBookingOrder = (
   listOrder: Array<any>,
   targetCurrency: string,
   listExchangeRate: Array<any>,
   listNearestExchangeRate: Array<any>
) => {
   const result = listOrder.map((element) => {
      const updatedElement = { ...element };

      // if current currency of order <> target currency -> exchange
      if (element.currency && element.currency?.currency !== targetCurrency) {
         // get exchange rate value
         const rate = getExchangeRate(
            listExchangeRate,
            listNearestExchangeRate,
            element.currency.currency,
            targetCurrency,
            element.date
         );

         updatedElement.dealerNet = Number(element.dealerNet) * Number(rate);

         updatedElement.dealerNetAfterSurcharge =
            Number(element.dealerNetAfterSurcharge) * Number(rate);

         updatedElement.totalCost = Number(element.totalCost) * Number(rate);

         updatedElement.marginAfterSurcharge = Number(element.marginAfterSurcharge) * Number(rate);

         updatedElement.netRevenue &&
            (updatedElement.netRevenue = Number(element.netRevenue) * Number(rate));

         updatedElement.currency = { currency: targetCurrency };
      }
      return updatedElement;
   });
   return result;
};

const getExchangeRate = (
   listExchangeRate: Array<any>,
   listNearestExchangeRate: Array<any>,
   from: string,
   to: string,
   date: any
) => {
   const foundElement = listExchangeRate.find((element) => {
      return (
         date &&
         element.from.currency === from &&
         element.to.currency === to &&
         date[1] === element.date[1] &&
         date[0] === element.date[0]
      );
   });

   if (foundElement) {
      return foundElement.rate;
   } else {
      const nearestEchangeRate = listNearestExchangeRate.find((element) => {
         return element.from.currency === from && element.to.currency === to;
      });
      return nearestEchangeRate.rate;
   }
};
