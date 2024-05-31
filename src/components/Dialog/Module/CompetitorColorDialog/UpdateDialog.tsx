import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import FormControlledTextField from '@/components/FormController/TextField';
import { SketchPicker } from 'react-color';
import { useForm } from 'react-hook-form';
import { AppTextField } from '@/components/App';
import competitorColorApi from '@/api/competitorColor.api';
import { commonStore, competitorColorStore } from '@/store/reducers';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

const DialogUpdateCompetitor: React.FC<any> = (props) => {
   const { open, onClose, detail } = props;

   const dispatch = useDispatch();
   const { t } = useTranslation();
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
               <SketchPicker color={chosenColor} onChangeComplete={handleChooseColor} />
            </Grid>
            <Grid item xs={6}>
               <FormControlledTextField
                  control={updateColorForm.control}
                  name="competitorName"
                  label={t('competitors.competitorName')}
                  required
                  disabled
                  defaultValue={chosenColor}
               />
               <div style={{ width: 20, height: 20 }}></div>

               <AppTextField
                  name="colorCode"
                  placeholder="Color Code in Hex"
                  value={chosenColor}
                  disabled
               />
               <div
                  style={{
                     backgroundColor: `${chosenColor}`,
                     width: 60,
                     height: 60,
                     marginTop: 20,
                  }}
               ></div>
            </Grid>
         </Grid>
      </AppDialog>
   );
};
export { DialogUpdateCompetitor };
