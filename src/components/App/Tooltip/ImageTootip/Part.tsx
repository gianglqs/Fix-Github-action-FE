import { Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { PartImage } from '../../Image/PartImage';
import { useEffect, useState } from 'react';

export default function PartImageTooltip(props) {
   const { imageName, onClick } = props;
   const [image, setImage] = useState();
   useEffect(() => {
      setImage(imageName);
   }, [props]);
   return (
      <Tooltip
         title={<PartImage imageName={image} height={70} width={70} onClick={onClick} />}
         placement="top-start"
         arrow
         onClick={onClick}
      >
         <ImageIcon />
      </Tooltip>
   );
}
