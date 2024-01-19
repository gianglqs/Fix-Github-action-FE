export const getProductImagePath = (imageName: string) => {
   return process.env.NEXT_PUBLIC_BACKEND_URL + 'loadImage/product/' + imageName;
};
