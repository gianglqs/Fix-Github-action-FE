import { getPartImagePath } from '@/utils/imagePath';
import { useEffect, useState } from 'react';

export function PartImage(props) {
   const { imageName, width, height, onClick } = props;
   const [imageUrl, setImageUrl] = useState(null);
   useEffect(() => {
      setImageUrl(getPartImagePath(imageName));
   }, [imageName]);

   return <img src={imageUrl} width={width} height={height} onClick={onClick} />;
}
