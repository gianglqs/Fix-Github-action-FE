import { getProductImagePath } from '@/utils/imagePath';
import { useEffect, useState } from 'react';

export function ProductImage(props) {
   const { imageName } = props;
   const [imageUrl, setImageUrl] = useState(null);
   console.log('imageUrl ', imageUrl);
   useEffect(() => {
      if (imageName != null && imageName.trim() != '') {
         setImageUrl(getProductImagePath(imageName));
      }
   }, [imageName]);

   return <img src={imageUrl} />;
}
