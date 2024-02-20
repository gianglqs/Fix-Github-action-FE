import { IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { getProductImagePath } from '@/utils/imagePath';
import { ProductImage } from '../Image/ProductImage';

export default function ChooseImage(props) {
   const { image, setImage } = props;
   const [isHovered, setIsHovered] = useState(false);
   const [imageUrl, setImageUrl] = useState(image);
   const [isChoosingFile, setIsChoosingFile] = useState(false);

   const handleChooseImage = () => {};

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

   return (
      <div
         style={{
            position: 'relative',
            display: 'inline-block',
         }}
      >
         <div
            {...getRootProps()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
               height: '120px',
               width: '120px',
               backgroundColor: '#ECECEC',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
            }}
         >
            <ProductImage
               imageUrl={imageUrl}
               style={{ objectFit: 'cover', height: '100%', width: '100%' }}
               isImageChoose={isChoosingFile}
            />
            <IconButton
               aria-label="Upload Image"
               style={{
                  opacity: isHovered ? 0.7 : 0,
                  transition: 'opacity 0.4s ease',
                  position: 'absolute',
                  color: 'black',
               }}
               onClick={handleChooseImage}
            >
               <CloudUploadIcon />
            </IconButton>
         </div>
         <input {...getInputProps()} />
      </div>
   );
}
