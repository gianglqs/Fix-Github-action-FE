import { Dialog } from '@mui/material';
import { useEffect, useState } from 'react';

export default function ShowImageDialog(props) {
   const { open, imageUrl, onClose } = props;
   const [image, setImage] = useState();
   useEffect(() => {
      setImage(imageUrl);
   }, [imageUrl]);
   return (
      <Dialog fullWidth={true} maxWidth="lg" open={open} onClose={onClose}>
         <img src={image} />
      </Dialog>
   );
}
