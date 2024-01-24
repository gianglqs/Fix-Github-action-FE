export const defaultPartImage = require('@/public/images/defaultPartImage.png');
export const defaultProductImage = require('@/public/images/defaultProductImage.png');

export const getProductImagePath = (imageName) => {
   if (checkNoneEmptyString(imageName)) return process.env.NEXT_PUBLIC_SERVER + imageName;
   return defaultProductImage;
};

export const getPartImagePath = (imageName) => {
   if (checkNoneEmptyString(imageName)) return process.env.NEXT_PUBLIC_SERVER + imageName;
   return defaultPartImage;
};

export const checkNoneEmptyString = (s) => {
   return typeof s === 'string' && s.length !== 0;
};
