import { Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import { SketchPicker } from 'react-color';
import { useTranslation } from 'react-i18next';
import { AppDialog } from '../AppDialog/AppDialog';

const ColorPickerDialog: React.FC<any> = (props) => {
   const { open, onClose, color, updateColor } = props;
   const { t } = useTranslation();

   const [selectedColor, setSelectedColor] = useState(color);

   useEffect(() => {
      setSelectedColor(color);
   }, [color]);

   const handleSubmitColor = (e) => {
      e.preventDefault();
      updateColor(selectedColor);
      onClose();
   };

   return (
      <AppDialog
         open={open}
         onOk={handleSubmitColor}
         onClose={onClose}
         title={t('competitors.competitorLegendColor')}
         okText={t('button.save')}
         closeText={t('button.close')}
      >
         <Grid
            container
            sx={{ paddingTop: 0.8, paddingBottom: 0.8, alignItems: 'center' }}
            spacing={2}
         >
            <Grid item xs={6}>
               <SketchPicker
                  color={selectedColor}
                  onChangeComplete={(e) => setSelectedColor(e.hex)}
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export default ColorPickerDialog;
