import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useMemo, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import FormControlledTextField from '@/components/FormController/TextField';
import { useForm } from 'react-hook-form';
import { AppTextField } from '@/components/App';
import { commonStore, competitorColorStore } from '@/store/reducers';
import { useSelector } from 'react-redux';
import ChooseImage from '@/components/App/chooseImage';
import productApi from '@/api/product.api';

const DialogUpdateProduct: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);

   const [info, setInfo] = useState(detail);
   const [imageFile, setImageFile] = useState(null);

   const updateProduct = useForm({
      shouldUnregister: false,
      defaultValues: detail,
   });

   const handleSubmitForm = updateProduct.handleSubmit(async () => {
      const transformedData = {
         modelCode: detail?.modelCode,
         image: imageFile,
         description: info.description,
      };
      try {
         setLoading(true);
         await productApi.updateProduct(transformedData);

         // dispatch(
         //    competitorColorStore.actions.setCompetitorColorList(
         //       JSON.parse(competitorColorList?.data)?.competitorColors
         //    )
         // );

         dispatch(commonStore.actions.setSuccessMessage('Update Product successfully!'));
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error?.message));
      }
      onClose();
      setLoading(false);
   });
   console.log('info', info);
   console.log('detail', detail);

   useEffect(() => {
      setInfo(detail);
      updateProduct.reset(detail);
   }, [detail]);

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
               <ChooseImage image={info.image} setImage={setImageFile} />
            </Grid>
            <Grid item xs={9}>
               <Typography variant="h6" component="h2">
                  {info.modelCode}
               </Typography>

               <div style={{ width: 20, height: 10 }}></div>

               <FormControlledTextField
                  control={updateProduct.control}
                  name="description"
                  label="Description"
                  defaultValue={info.description}
                  multiline
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogUpdateProduct };
