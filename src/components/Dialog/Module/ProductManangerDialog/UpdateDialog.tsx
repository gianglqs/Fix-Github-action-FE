import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { AppTextField } from '@/components/App';
import { commonStore, productStore } from '@/store/reducers';
import ChooseImage from '@/components/App/chooseImage';
import productApi from '@/api/product.api';
import { useTranslation } from 'react-i18next';
import { json } from 'stream/consumers';
import { gridColumnGroupsUnwrappedModelSelector } from '@mui/x-data-grid-pro';

const DialogUpdateProduct: React.FC<any> = (props) => {
   const { open, onClose, preValue, handleOpenImageDialog } = props;

   const dispatch = useDispatch();

   const { t } = useTranslation();

   const [newValue, setNewValue] = useState(preValue);

   const [imageFile, setImageFile] = useState(null); // image data - not link !

   const [enableSubmitForm, setEnableSubmitForm] = useState(false);

   const updateProduct = useForm({
      shouldUnregister: false,
      defaultValues: preValue,
   });

   const updateForm = new FormData();

   // if there are any changes -> allow submit
   useEffect(() => {
      if (newValue.description !== preValue.description || imageFile) {
         setEnableSubmitForm(true);
      } else {
         setEnableSubmitForm(false);
      }
   }, [imageFile, newValue.description]);

   const handleSubmitForm = updateProduct.handleSubmit(async () => {
      updateForm.append('modelCode', preValue?.modelCode);
      updateForm.append('series', preValue?.series);

      // if have change image
      imageFile && updateForm.append('image', imageFile);

      // if have change description
      if (newValue.description !== preValue.description)
         updateForm.append('description', newValue.description);

      gridColumnGroupsUnwrappedModelSelector;

      try {
         await productApi.updateProduct(updateForm);

         dispatch(productStore.sagaGetList());

         dispatch(commonStore.actions.setSuccessMessage('Update Product successfully!'));
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error?.message));
      }
      handleCloseForm();
   });

   useEffect(() => {
      setNewValue(preValue);
      updateProduct.reset(preValue);
   }, [preValue]);

   const handleCloseForm = () => {
      setImageFile(null);
      onClose();
   };

   return (
      <AppDialog
         open={open}
         disableOK={!enableSubmitForm}
         onOk={handleSubmitForm}
         onClose={handleCloseForm}
         title={t('updateProduct')}
         okText={t('button.save')}
         closeText={t('button.close')}
      >
         <Grid
            container
            sx={{ paddingTop: 0.8, paddingBottom: 0.8, alignItems: 'center' }}
            spacing={2}
         >
            <Grid item xs={4}>
               <ChooseImage
                  image={newValue.image}
                  setImage={setImageFile}
                  handleOpenImageDialog={handleOpenImageDialog}
               />
            </Grid>
            <Grid item xs={8}>
               <Typography variant="h6" component="h2">
                  {newValue.modelCode}
               </Typography>

               <div style={{ width: 20, height: 10 }}></div>

               <AppTextField
                  name="description"
                  id="outlined-required"
                  label={t('table.description')}
                  defaultValue=" "
                  rows={3}
                  value={newValue.description}
                  onChange={(e) =>
                     setNewValue((prev) => ({ ...prev, description: e.target.value }))
                  }
                  debounceDelay={0}
                  multiline
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogUpdateProduct };
