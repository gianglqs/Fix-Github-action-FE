export const convertCurrencyOfDataBookingOrder = (
   listOrder: Array<any>,
   targetCurrency: string,
   listExchangeRate: Array<any>
) => {
   const result = listOrder.map((element) => {
      const updatedElement = { ...element };

      // if current currency of order <> target currency -> exchange
      if (element.currency && element.currency?.currency !== targetCurrency) {
         // get exchange rate value
         const rate = getExchangeRate(listExchangeRate, element.currency.currency, targetCurrency);

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

const getExchangeRate = (listExchangeRate: Array<any>, from: string, to: string) => {
   const foundElement = listExchangeRate.find((element) => {
      return element.from.currency === from && element.to.currency === to;
   });

   if (foundElement) {
      return foundElement.rate;
   }
};
