export const getProductImagePath = (imageName: string) => {
   if (typeof imageName === 'string' && imageName.length !== 0)
      return process.env.NEXT_PUBLIC_BACKEND_URL + 'loadImage/product/' + imageName;
};
