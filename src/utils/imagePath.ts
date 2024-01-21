export const defaultPartImage = require('@/public/images/defaultPartImage.png');
export const defaultProductImage = require('@/public/images/defaultProductImage.png');

export const getProductImagePath = (imageName) => {
   if (checkNoneEmptyString(imageName))
      return process.env.NEXT_PUBLIC_BACKEND_URL + 'loadImage/product/' + imageName;
   return defaultProductImage;
};

export const getPartImagePath = (imageName) => {
   if (checkNoneEmptyString(imageName))
      return process.env.NEXT_PUBLIC_BACKEND_URL + 'loadImage/part/' + imageName;
   return defaultPartImage;
};

export const checkNoneEmptyString = (s) => {
   return typeof s === 'string' && s.length !== 0;
};
