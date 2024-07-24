import { ProductImage } from '@/components/App/Image/ProductImage';
import { imageDialogStore } from '@/store/reducers';
import { WidthFull } from '@mui/icons-material';
import { Dialog } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

export default function ShowImageDialog() {
   const dispath = useDispatch();

   const imageURL = useSelector(imageDialogStore.selectImageURL);
   const state = useSelector(imageDialogStore.selectDialogState);

   const handleCloseDialog = () => {
      dispath(imageDialogStore.actions.closeDialog());
   };

   return (
      <Dialog
         maxWidth="md"
         open={state}
         onClose={handleCloseDialog}
         sx={{
            '& .MuiDialog-paper': {
               width: '100%',
               maxWidth: 'md',
               height: 'auto',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
            },
         }}
      >
         <ProductImage
            imageUrl={imageURL}
            style={{
               objectFit: 'contain',
               maxHeight: '90vh',
               maxWidth: '100%',
            }}
         />
      </Dialog>
   );
}
