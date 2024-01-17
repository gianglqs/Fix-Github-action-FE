import { Button, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useState } from 'react';

export default function ChooseImage() {
   const [isHovered, setIsHovered] = useState(false);
   const handleChooseImage = () => {};

   return (
      <>
         <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
               height: '120px',
               width: '120px',
               backgroundColor: 'red',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
            }}
         >
            <IconButton
               color="secondary"
               aria-label="Upload Image"
               style={{
                  opacity: isHovered ? 0.7 : 0,
                  transition: 'opacity 0.4s ease',
                  position: 'absolute',
               }}
               onClick={handleChooseImage}
            >
               <CloudUploadIcon />
            </IconButton>
         </div>
      </>
   );
}
