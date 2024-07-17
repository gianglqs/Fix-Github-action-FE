import indicatorApi from '@/api/indicators.api';
import { AppAutocomplete, AppNumberField, AppTextField } from '@/components/App';
import AutoCompleteHasCreateNew from '@/components/App/AutocompleteWithCreateNew';
import { commonStore, indicatorStore, manageCompetitorStore } from '@/store/reducers';
import { Box, Button, Dialog, Grid, Typography, styled } from '@mui/material';
import { t } from 'i18next';
import { produce } from 'immer';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { DialogUpdateCompetitor } from '../CompetitorColorDialog/UpdateDialog';
import { useState } from 'react';
import ColorPickerDialog from '../ColorPicker';

const StyledAutoComplete = styled(AppAutocomplete)(() => ({
   '& .MuiTextField-root': {
      maxHeight: 38,
   },
   '& .MuiAutocomplete-tag': {
      marginLeft: 5,
   },
   '& .MuiInputBase-root': {
      height: 38,
      backgroundColor: '#f5f7fa',
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& .MuiOutlinedInput-input': {
      boxSizing: 'inherit',
   },
   '& input': {
      height: 38,
      fontSize: 14,
   },
   '& .MuiInputLabel-root': {
      transform: 'translate(14px, 1px) scale(1)',
      position: 'absolute',
      top: 10,
   },
   '& .MuiInputLabel-shrink': {
      transform: 'translate(15px, -18px) scale(0.8)',
      fontSize: 14,
      backgroundColor: '#f5f7fa',
      padding: '0 7px 0 5px',
      borderRadius: 999,
   },
}));

const StyleAppTextField = styled(AppTextField)(() => ({
   '& .MuiTextField-root': {
      maxHeight: 38,
   },
   '& .MuiAutocomplete-tag': {
      marginLeft: 5,
   },
   '& .MuiInputBase-root': {
      height: 38,
      backgroundColor: '#f5f7fa',
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& input': {
      height: 38,
      fontSize: 14,
   },
   '& .MuiInputLabel-root': {
      transform: 'translate(14px, 1px) scale(1)',
      position: 'absolute',
      top: 10,
   },
   '& .MuiInputLabel-shrink': {
      transform: 'translate(15px, -18px) scale(0.8)',
      fontSize: 14,
      backgroundColor: '#f5f7fa',
      padding: '0 7px 0 5px',
      borderRadius: 999,
   },
}));

const StyleAppNumerField = styled(AppNumberField)(() => ({
   '& .MuiTextField-root': {
      maxHeight: 38,
   },
   '& .MuiAutocomplete-tag': {
      marginLeft: 5,
   },
   '& .MuiInputBase-root': {
      height: 38,
      backgroundColor: '#f5f7fa',
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& input': {
      height: 38,
      fontSize: 14,
   },
   '& .MuiInputLabel-root': {
      transform: 'translate(14px, 1px) scale(1)',
      position: 'absolute',
      top: 10,
   },
   '& .MuiInputLabel-shrink': {
      transform: 'translate(15px, -18px) scale(0.8)',
      fontSize: 14,
      backgroundColor: '#f5f7fa',
      padding: '0 7px 0 5px',
      borderRadius: 999,
   },
}));

const StyledAutoCompleteHasCreateNew = styled(AutoCompleteHasCreateNew)(() => ({
   '& .MuiTextField-root': {
      maxHeight: 38,
   },
   '& .MuiAutocomplete-tag': {
      marginLeft: 5,
   },
   '& .MuiInputBase-root': {
      height: 38,
      backgroundColor: '#f5f7fa',
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& .MuiOutlinedInput-notchedOutline': {
      border: '1px solid #eef1f6',
      borderRadius: 5,
   },
   '& .MuiOutlinedInput-input': {
      boxSizing: 'inherit',
   },
   '& input': {
      height: 38,
      fontSize: 14,
   },
   '& .MuiInputLabel-root': {
      transform: 'translate(14px, 1px) scale(1)',
      position: 'absolute',
      top: 10,
   },
   '& .MuiInputLabel-shrink': {
      transform: 'translate(15px, -18px) scale(0.8)',
      fontSize: 14,
      backgroundColor: '#f5f7fa',
      padding: '0 7px 0 5px',
      borderRadius: 999,
   },
}));

const EditDataIndicator: React.FC<any> = (props) => {
   const { open, onClose, data, setData, isCreate, setOpenConfirmDeleteDialog } = props;
   const dispatch = useDispatch();

   const initDataFilter = useSelector(manageCompetitorStore.selectInitDataFilter);

   const [openSelectColor, setOpenSelectColor] = useState(false);

   const defaultGroupColor = 'black';

   const handleOpenSelectColor = () => {
      if (data?.color?.groupName && data?.color?.groupName.trim() !== '') setOpenSelectColor(true);
   };

   const handleCloseSelectColor = () => {
      setOpenSelectColor(false);
   };

   const updateColor = (color: string) => {
      console.log('update Color', color);
      setData((prev) => ({ ...prev, color: { ...prev.color, colorCode: color } }));
   };

   const handleChangeDataFilter = (option, path) => {
      setData((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['chineseBrand'], path)) {
               if (option === 'Chinese Brand') draft[path] = true;
               else draft[path] = false;
            } else {
               if (path === 'color.groupName') {
                  draft.color = getGroupByGroupName(option);
               } else {
                  const keys = path.split('.');
                  let temp = draft;

                  for (let i = 0; i < keys.length - 1; i++) {
                     if (!temp[keys[i]]) {
                        temp[keys[i]] = {};
                     }
                     temp = temp[keys[i]];
                  }

                  temp[keys[keys.length - 1]] = option;
               }
            }
         })
      );
   };

   const getGroupByGroupName = (groupName: string) => {
      return (
         initDataFilter?.groups.find((item) => item.groupName === groupName) || {
            groupName,
            colorCode: defaultGroupColor,
         }
      );
   };

   const handleUpdateCompetitor = () => {
      dispatch(indicatorStore.actions.setLoadingPage(true));
      indicatorApi
         .updateCompetitor(isCreate, data)
         .then((res) => {
            dispatch(commonStore.actions.setSuccessMessage(res.data.message));
            dispatch(indicatorStore.sagaGetList());
            dispatch(indicatorStore.actions.setLoadingPage(false));
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
            dispatch(indicatorStore.actions.setLoadingPage(false));
         });
   };

   const handleOpenConfirmDeleteDialog = () => {
      setOpenConfirmDeleteDialog(true);
   };

   return (
      <Dialog
         open={open}
         onClose={onClose}
         draggable
         fullWidth={true}
         maxWidth="lg"
         PaperProps={{ sx: { borderRadius: '4px', paddingBottom: 3, zIndex: 10 } }}
      >
         <Typography variant="h5" sx={{ marginTop: 2, marginLeft: 4 }}>
            {isCreate ? t('button.create') : t('competitors.edit')} {t('competitors.competitor')}
         </Typography>

         <Grid sx={{ display: 'flex', justifyContent: 'flex-end', marginRight: 5, gap: 2 }}>
            {!isCreate && (
               <Button
                  variant="outlined"
                  sx={{ fontSize: 15 }}
                  onClick={handleOpenConfirmDeleteDialog}
                  color="error"
               >
                  {t('button.delete')}
               </Button>
            )}
            <Button variant="outlined" sx={{ fontSize: 15 }} onClick={handleUpdateCompetitor}>
               {isCreate ? t('button.create') : t('button.update')}
            </Button>
         </Grid>

         <Grid container sx={{ padding: '20px 40px' }}>
            <Grid spacing={3} container>
               <Grid item xs={3}>
                  <StyleAppTextField
                     required
                     id="outlined-read-only-input"
                     label={t('competitors.competitorName')}
                     value={data?.competitorName}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'competitorName')}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.tableTitle')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'tableTitle')}
                     value={data?.tableTitle}
                  />
               </Grid>

               <Grid item xs={3}>
                  <StyleAppTextField
                     label={t('competitors.battery')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'battery')}
                     value={data?.battery}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppTextField
                     label={t('competitors.model')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'model')}
                     value={data?.model}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppTextField
                     label={t('competitors.origin')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'origin')}
                     value={data?.origin}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppTextField
                     required
                     label={t('competitors.series')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'series.series')}
                     value={data?.series?.series}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyledAutoComplete
                     required
                     value={data?.country?.countryName}
                     options={initDataFilter.countries}
                     label={t('filters.country')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(option.value, 'country.countryName')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyledAutoComplete
                     value={data.chineseBrand ? 'Chinese Brands' : 'None Chinese Brand'}
                     options={initDataFilter.chineseBrands}
                     label={t('filters.chineseBrand')}
                     onChange={(e, option) => handleChangeDataFilter(option.value, 'chineseBrand')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyledAutoCompleteHasCreateNew
                     value={data?.plant}
                     options={initDataFilter.plants}
                     label={t('filters.plant')}
                     onChange={(e, option) => handleChangeDataFilter(option.value, 'plant')}
                     primaryKeyOption="value"
                     disableClearable={false}
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyledAutoComplete
                     value={data?.clazz?.clazzName}
                     options={initDataFilter.classes}
                     label={t('filters.class')}
                     required
                     onChange={(e, option) =>
                        handleChangeDataFilter(option.value, 'clazz.clazzName')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyledAutoCompleteHasCreateNew
                     value={data?.category}
                     options={initDataFilter.categories}
                     label={t('filters.category')}
                     onChange={(e, option) => handleChangeDataFilter(option.value, 'category')}
                     primaryKeyOption="value"
                     disableClearable={false}
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={3}>
                  <StyleAppNumerField
                     value={data?.actual}
                     onChange={(e) => handleChangeDataFilter(e.value, 'actual')}
                     label={t('competitors.actual')}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.aopf')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'aopf')}
                     value={data?.aopf}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.lrff')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'lrff')}
                     value={data?.lrff}
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.competitorLeadTime')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'competitorLeadTime')}
                     value={data?.competitorLeadTime}
                  />
               </Grid>

               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.competitorPricing')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'competitorPricing')}
                     value={data?.competitorPricing}
                     prefix="$ "
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.dealerPricingPremium')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'dealerPremiumPercentage')}
                     value={data?.dealerPremiumPercentage}
                     prefix="$ "
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.dealerNet')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'dealerNet')}
                     value={data?.dealerNet}
                     prefix="$ "
                  />
               </Grid>

               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.tonnage')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'tonnage')}
                     value={data?.tonnage}
                  />
               </Grid>

               <Grid item xs={3}>
                  <StyleAppNumerField
                     label={t('competitors.marketShare')}
                     onChange={(e) => handleChangeDataFilter(e.value, 'marketShare')}
                     value={data?.marketShare}
                     suffix="%"
                  />
               </Grid>
               <Grid item xs={3}>
                  <StyledAutoCompleteHasCreateNew
                     required
                     value={data?.color?.groupName}
                     options={initDataFilter.groups}
                     label={t('filters.group')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(option.groupName, 'color.groupName')
                     }
                     primaryKeyOption="groupName"
                     disableClearable={false}
                     renderOption={(prop, option) => `${option.groupName}`}
                     getOptionLabel={(option) => `${option.groupName}`}
                  />
               </Grid>
               <Grid item xs={1}>
                  <Box
                     sx={{
                        backgroundColor: data?.color?.colorCode
                           ? data?.color?.colorCode
                           : defaultGroupColor,
                        width: 35,
                        height: 35,
                        cursor: 'pointer',
                     }}
                     onClick={handleOpenSelectColor}
                  />
               </Grid>
            </Grid>
         </Grid>
         <ColorPickerDialog
            open={openSelectColor}
            onClose={handleCloseSelectColor}
            color={data?.color?.colorCode}
            updateColor={updateColor}
         />
      </Dialog>
   );
};

export default EditDataIndicator;
