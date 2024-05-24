import indicatorApi from '@/api/indicators.api';
import { AppAutocomplete, AppTextField } from '@/components/App';
import { commonStore, indicatorStore } from '@/store/reducers';
import { Button, Dialog, Grid, TextField, Typography } from '@mui/material';
import { t } from 'i18next';
import { produce } from 'immer';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

const EditDataIndicator: React.FC<any> = (props) => {
   const { open, onClose, data, setData, isCreate } = props;
   const dispatch = useDispatch();

   const initDataFilter = useSelector(indicatorStore.selectInitDataFilter);

   const handleChangeDataFilter = (option, path) => {
      setData((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['chineseBrand'], path)) {
               if (option === 'Chinese Brand') draft[path] = true;
               else draft[path] = false;
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
         })
      );
   };

   const handleUpdateCompetitor = () => {
      indicatorApi
         .updateCompetitor(data)
         .then((res) => {
            dispatch(commonStore.actions.setSuccessMessage(res.data.message));
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   console.log(data);

   return (
      <Dialog
         open={open}
         onClose={onClose}
         draggable
         fullWidth={true}
         maxWidth="lg"
         PaperProps={{ sx: { borderRadius: '10px' } }}
      >
         <Typography variant="h5" sx={{ marginTop: 2, marginLeft: 4 }}>
            {isCreate ? 'Create' : 'Edit'} Competitor
         </Typography>

         <Grid sx={{ display: 'flex', justifyContent: 'flex-end', marginRight: 5 }}>
            <Button variant="outlined" onClick={handleUpdateCompetitor}>
               {isCreate ? 'Create' : 'Update'}
            </Button>
         </Grid>

         <Grid container sx={{ padding: '40px' }}>
            <Grid spacing={3} container>
               <Grid item xs={2.5}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.competitorName')}
                     value={data?.competitorName}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'competitorName')}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.tableTitle')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'tableTitle')}
                     value={data?.tableTitle}
                  />
               </Grid>
               <Grid item xs={2.5}>
                  <AppAutocomplete
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
               <Grid item xs={2}>
                  <AppAutocomplete
                     value={
                        data.chineseBrand
                           ? { value: 'Chinese Brands' }
                           : { value: 'None Chinese Brand' }
                     }
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
               <Grid item xs={2}>
                  <AppAutocomplete
                     value={data?.plant}
                     options={initDataFilter.plants}
                     label={t('filters.plant')}
                     onChange={(e, option) => handleChangeDataFilter(option.value, 'plant')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     value={data?.clazz?.clazzName}
                     options={initDataFilter.classes}
                     label={t('filters.class')}
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
               <Grid item xs={2.5}>
                  <AppAutocomplete
                     value={data?.category}
                     options={initDataFilter.categories}
                     label={t('filters.category')}
                     onChange={(e, option) => handleChangeDataFilter(option.value, 'category')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.battery')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'battery')}
                     value={data?.battery}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.origin')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'origin')}
                     value={data?.origin}
                  />
               </Grid>
               <Grid item xs={1.5}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('competitors.series')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'series')}
                     value={data?.series}
                  />
               </Grid>
               <Grid item xs={2}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('competitors.actual')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'actual')}
                     value={data?.actual}
                  />
               </Grid>
               <Grid item xs={2}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('competitors.aopf')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'aopf')}
                     value={data?.aopf}
                  />
               </Grid>
               <Grid item xs={2}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('competitors.lrff')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'lrff')}
                     value={data?.lrff}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.competitorLeadTime')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'competitorLeadTime')}
                     value={data?.competitorLeadTime}
                  />
               </Grid>

               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.competitorPricing')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'competitorPricing')}
                     value={data?.competitorPricing}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.dealerPricingPremium')}
                     onChange={(e) =>
                        handleChangeDataFilter(e.target.value, 'dealerPremiumPercentage')
                     }
                     value={data?.dealerPremiumPercentage}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.dealerNet')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'dealerNet')}
                     value={data?.dealerNet}
                  />
               </Grid>

               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.tonnage')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'tonnage')}
                     value={data?.tonnage}
                  />
               </Grid>

               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.marketShare')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'marketShare')}
                     value={data?.marketShare}
                  />
               </Grid>
               <Grid item xs={3}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('competitors.updateDate')}
                     onChange={(e) => handleChangeDataFilter(e.target.value, 'updateDate')}
                     value={data?.updateDate}
                  />
               </Grid>
            </Grid>
         </Grid>
      </Dialog>
   );
};

export default EditDataIndicator;
