import { Box, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getProductImagePath } from '@/utils/imagePath';
import { ProductImage } from '../Image/ProductImage';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import { imageDialogStore } from '@/store/reducers';
import { useDispatch } from 'react-redux';

export default function ChooseImage(props) {
   const { image, setImage, width, height } = props;
   const [isHovered, setIsHovered] = useState(false);
   const [imageUrl, setImageUrl] = useState(image);
   const [isChoosingFile, setIsChoosingFile] = useState(false);
   const dispath = useDispatch();

   const onDrop = (acceptedFiles) => {
      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = () => {
         setImageUrl(reader.result);
         setImage(file);
         setIsChoosingFile(true);
      };

      reader.readAsDataURL(file);
   };
   const { getRootProps, getInputProps } = useDropzone({
      onDrop,
      accept: {
         'image/jpeg': ['.jpeg', '.jpg'],
         'image/png': ['.png'],
      },
   });

   useEffect(() => {
      setImageUrl(image);
   }, [image]);

   const handleOpenImageDialog = (imageURL: string) => {
      dispath(imageDialogStore.actions.setImageURL(imageURL));
      dispath(imageDialogStore.actions.openDialog());
   };
   return (
      <div
         style={{
            position: 'relative',
            display: 'inline-block',
         }}
      >
         <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
               height: '100%',
               width: '100%',
               backgroundColor: '#ECECEC',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
            }}
         >
            <Box
               sx={{
                  opacity: !isHovered ? 1 : 0.2,
                  transition: 'opacity 0.4s ease',
                  color: 'white',
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <ProductImage
                  imageUrl={imageUrl}
                  style={{
                     objectFit: 'cover',
                     minHeight: '150px',
                     minWidth: '150px',
                     height: height || '100%',
                     width: width || '100%',
                  }}
                  isImageChoose={isChoosingFile}
               />
            </Box>
            <Box sx={{ display: 'flex', gap: 3, position: 'absolute', zIndex: 100 }}>
               <IconButton
                  aria-label="Upload Image"
                  style={{
                     opacity: isHovered ? 1 : 0,
                     transition: 'opacity 0.4s ease',
                     color: 'black',
                  }}
                  {...getRootProps()}
                  // onClick={handleChooseImage}
               >
                  <CloudUploadIcon />
               </IconButton>

               <IconButton
                  style={{
                     opacity: isHovered ? 1 : 0,
                     transition: 'opacity 0.4s ease',
                     color: 'black',
                  }}
                  onClick={() => handleOpenImageDialog(image)}
               >
                  <RemoveRedEyeIcon />
               </IconButton>
            </Box>
         </div>
         <input {...getInputProps()} />
      </div>
   );
}
