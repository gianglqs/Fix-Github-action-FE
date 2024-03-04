const defaultProductImage = require('@/public/images/defaultProductImage.png');
import { checkNoneEmptyString } from '@/utils/imagePath';
import { useEffect, useState } from 'react';

export function ProductImage(props) {
   const { imageUrl, style, onClick, isImageChoose } = props;
   const [correctImageUrl, setCorrectImageUrl] = useState('');
   useEffect(() => {
      if (isImageChoose) {
         console.log('chooese image');
         setCorrectImageUrl(imageUrl);
      } else if (checkNoneEmptyString(imageUrl)) {
         fetch(process.env.NEXT_PUBLIC_BACKEND_URL + imageUrl).then((res) => {
            console.log('ression', res);
            if (res.ok) {
               setCorrectImageUrl(process.env.NEXT_PUBLIC_BACKEND_URL + imageUrl);
            } else {
               setCorrectImageUrl(defaultProductImage);
            }
         });
      } else {
         setCorrectImageUrl(defaultProductImage);
      }
   }, [imageUrl]);

   return <img src={correctImageUrl} style={style} onClick={onClick} />;
}
