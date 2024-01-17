import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useMemo, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import FormControlledTextField from '@/components/FormController/TextField';
import { SketchPicker } from 'react-color';
import { yupResolver } from '@hookform/resolvers/yup';
import getValidationSchema from '../Dashboard/validationSchema';
import { useForm } from 'react-hook-form';
import { AppTextField } from '@/components/App';
import competitorColorApi from '@/api/competitorColor.api';
import { commonStore, competitorColorStore } from '@/store/reducers';
import { useSelector } from 'react-redux';
import ChooseImage from '@/components/App/chooseImage';

const DialogUpdateProduct: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   const dispatch = useDispatch();
   const [loading, setLoading] = useState(false);

   const [chosenColor, setChosenColor] = useState(detail.colorCode);

   const updateColorForm = useForm({
      shouldUnregister: false,
      defaultValues: detail,
   });

   const search = useSelector(competitorColorStore.selectCompetitorColorSearch);

   const handleSubmitForm = updateColorForm.handleSubmit(async (data: any) => {
      const transformedData = {
         id: detail?.id,
         groupName: data.groupName,
         colorCode: chosenColor,
      };
      try {
         setLoading(true);
         await competitorColorApi.updateCompetitorColor(transformedData);

         const competitorColorList = await competitorColorApi.getCompetitorColor({
            search: search,
         });
         dispatch(
            competitorColorStore.actions.setCompetitorColorList(
               JSON.parse(competitorColorList?.data)?.competitorColors
            )
         );

         dispatch(commonStore.actions.setSuccessMessage('Update Competitor Color successfully'));
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error?.message));
      }
      onClose();
      setLoading(false);
   });

   const handleChooseColor = (color) => {
      setChosenColor(color.hex);
   };

   useEffect(() => {
      setChosenColor(detail.colorCode);
      updateColorForm.reset(detail);
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
               <ChooseImage />
            </Grid>
            <Grid item xs={9}>
               <Typography variant="h5" component="h2">
                  MH370
               </Typography>

               <div style={{ width: 20, height: 10 }}></div>

               <FormControlledTextField
                  control={updateColorForm.control}
                  name="description"
                  label="Description"
                  defaultValue={chosenColor}
                  multiline
               />
            </Grid>
         </Grid>
      </AppDialog>
   );
};

export { DialogUpdateProduct };
