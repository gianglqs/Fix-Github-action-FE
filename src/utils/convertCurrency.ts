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

         updatedElement.dealerNetAfterSurCharge =
            Number(element.dealerNetAfterSurCharge) * Number(rate);

         updatedElement.totalCost = Number(element.totalCost) * Number(rate);

         updatedElement.marginAfterSurCharge = Number(element.marginAfterSurCharge) * Number(rate);

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
