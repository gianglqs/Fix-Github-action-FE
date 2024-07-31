const defaultProductImage = require('@/public/images/defaultProductImage.png');
import { PRODUCT_IMAGE_FOLDER } from '@/Path/backend';
import { checkNoneEmptyString } from '@/utils/imagePath';
import { useEffect, useState } from 'react';

export function ProductImage(props) {
   const { imageUrl, style, onClick, isImageChoose } = props;
   const [correctImageUrl, setCorrectImageUrl] = useState('');
   useEffect(() => {
      if (isImageChoose) {
         setCorrectImageUrl(imageUrl);
      } else if (checkNoneEmptyString(imageUrl)) {
         fetch(process.env.NEXT_PUBLIC_BACKEND_URL + PRODUCT_IMAGE_FOLDER + imageUrl).then(
            (res) => {
               if (res.ok) {
                  setCorrectImageUrl(
                     process.env.NEXT_PUBLIC_BACKEND_URL + PRODUCT_IMAGE_FOLDER + imageUrl
                  );
               }
               if (res.status === 404) {
                  setCorrectImageUrl(defaultProductImage);
               }
            }
         );
      } else if (imageUrl !== undefined) {
         setCorrectImageUrl(defaultProductImage);
      }
   }, [imageUrl]);
   return <img src={correctImageUrl} style={style} onClick={onClick} />;
}
