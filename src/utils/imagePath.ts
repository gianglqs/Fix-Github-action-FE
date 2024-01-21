export const getProductImagePath = (imageName) => {
   if (checkNoneEmptyString(imageName))
      return process.env.NEXT_PUBLIC_BACKEND_URL + 'loadImage/product/' + imageName;
};

export const getPartImagePath = (imageName) => {
   if (checkNoneEmptyString(imageName))
      return process.env.NEXT_PUBLIC_BACKEND_URL + 'loadImage/part/' + imageName;
};

export const checkNoneEmptyString = (s) => {
   return typeof s === 'string' && s.length !== 0;
};
