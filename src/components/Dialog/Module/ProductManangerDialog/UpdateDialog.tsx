import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useMemo, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import FormControlledTextField from '@/components/FormController/TextField';
import { useForm } from 'react-hook-form';
import { AppTextField } from '@/components/App';
import { commonStore, competitorColorStore, productStore } from '@/store/reducers';
import { useSelector } from 'react-redux';
import ChooseImage from '@/components/App/chooseImage';
import productApi from '@/api/product.api';

const DialogUpdateProduct: React.FC<any> = (props) => {
   const { open, onClose, preValue } = props;

   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);

   const [newValue, setNewValue] = useState(preValue);
   const [imageFile, setImageFile] = useState(null); // image value - not link !

   const updateProduct = useForm({
      shouldUnregister: false,
      defaultValues: preValue,
   });

   const updateForm = new FormData();

   const handleSubmitForm = updateProduct.handleSubmit(async () => {
      updateForm.append('image', imageFile);
      updateForm.append('modelCode', preValue?.modelCode);
      updateForm.append('description', newValue.description);
      console.log(updateForm);
      try {
         setLoading(true);
         await productApi.updateProduct(updateForm);

         dispatch(productStore.sagaGetList());

         dispatch(commonStore.actions.setSuccessMessage('Update Product successfully!'));
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error?.message));
      }
      onClose();
      setLoading(false);
   });

   useEffect(() => {
      setNewValue(preValue);
      updateProduct.reset(preValue);
   }, [preValue]);

   return (
      <AppDialog
         open={open}
         loading={loading}
         onOk={handleSubmitForm}
         onClose={onClose}
         title="Update Product"
         okText="Save"
      >
         <Grid
            container
            sx={{ paddingTop: 0.8, paddingBottom: 0.8, alignItems: 'center' }}
            spacing={2}
         >
            <Grid item xs={3}>
               <ChooseImage image={newValue.image} setImage={setImageFile} />
            </Grid>
            <Grid item xs={9}>
               <Typography variant="h6" component="h2">
                  {newValue.modelCode}
               </Typography>

               <div style={{ width: 20, height: 10 }}></div>

               <FormControlledTextField
                  control={updateProduct.control}
                  name="description"
                  label="Description"
                  defaultValue={newValue.description}
                  onChange={(e) => setNewValue(prev => {...prev, description:e.target.value})}
                  multiline
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogUpdateProduct };
