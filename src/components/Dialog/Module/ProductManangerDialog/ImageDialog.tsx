import { ProductImage } from '@/components/App/Image/ProductImage';
import { Dialog } from '@mui/material';
import { useEffect, useState } from 'react';

export default function ShowImageDialog(props) {
   const { open, imageUrl, onClose } = props;
   const [image, setImage] = useState(undefined);
   useEffect(() => {
      setImage(imageUrl);
   }, [imageUrl]);
   return (
      <Dialog maxWidth="lg" open={open} onClose={onClose}>
         <ProductImage imageUrl={image} style={{ objectFit: 'contain' }} />
      </Dialog>
   );
}
