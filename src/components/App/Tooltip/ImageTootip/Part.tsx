import { Tooltip } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { PartImage } from '../../Image/PartImage';
import { useEffect, useState } from 'react';

export default function PartImageTooltip(props) {
   const [imageName, setImageName] = useState();
   useEffect(() => {
      setImageName(props?.imageName);
   }, [props]);
   return (
      <Tooltip
         title={<PartImage imageName={imageName} height={40} width={40} />}
         placement="top-start"
         arrow
      >
         <ImageIcon />
      </Tooltip>
   );
}
