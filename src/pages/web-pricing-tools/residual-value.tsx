import { useContext, useEffect, useState } from 'react';

import { importFailureStore, residualValueStore } from '@/store/reducers';
import { formatNumberTwoPercentDigit } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';

import { AppAutocomplete, AppLayout, AppNumberField } from '@/components';

import _ from 'lodash';

import residualValueApi from '@/api/residualValue.api';
import { ProductImage } from '@/components/App/Image/ProductImage';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { boxStyle } from '@/theme/paperStyle';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { defaultValueFilterResidualValue } from '@/utils/defaultValues';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { RESIDUAL_VALUE } from '@/utils/modelType';
import { createAction } from '@reduxjs/toolkit';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';

import AppBackDrop from '@/components/App/BackDrop';
import { UploadFileDropZone } from '@/components/App/UploadFileDropZone';
import GetAppIcon from '@mui/icons-material/GetApp';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function ResidualValue() {
   const dispatch = useDispatch();
   const { t } = useTranslation();
   useEffect(() => {
      createAction(`residualValue/reloadModelCode`);
      //set initial last updated info for first load page
      residualValueApi.getLastUpdatedInfo().then((result) => {
         const parsedResult = JSON.parse(result?.data);
         dispatch(residualValueStore.actions.setLastUpdatedBy(parsedResult.lastUpdatedBy));
         dispatch(residualValueStore.actions.setServerTimeZone(parsedResult.serverTimeZone));
         dispatch(residualValueStore.actions.setLastUpdatedTime(parsedResult.lastUpdatedTime));
      });
   }, []);

   const listResidualValue = useSelector(residualValueStore.selectListResidualValue);

   const initDataFilterModelTypeAndBrand = useSelector(
      residualValueStore.selectInitDataFilterModelTypeAndBrand
   );
   const initDataFilterModelCode = useSelector(residualValueStore.selectInitDataFilterModelCode);

   const dataFilter = useSelector(residualValueStore.selectDataFilter);

   const serverTimeZone = useSelector(residualValueStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(residualValueStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(residualValueStore.selectLastUpdatedBy);
   const exampleFile = useSelector(residualValueStore.selectExampleUploadFile);
   const loadingPage = useSelector(residualValueStore.selectLoadingPage);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const [selectedResidualValue, setSelectedResidualValue] = useState([]);
   const [image, setImage] = useState(undefined);

   // import failure dialog
   const importFailureDialogDataFilter = useSelector(importFailureStore.selectDataFilter);

   const handleChangeDataFilter = (option, field) => {
      let newDataFilter;
      if (_.includes(['modelType', 'brand'], field)) {
         newDataFilter = { ...dataFilter, [field]: option, modelCode: null };
      } else {
         newDataFilter = { ...dataFilter, [field]: option };
      }
      dispatch(residualValueStore.actions.setDataFilter(newDataFilter));
      dispatch(residualValueStore.reloadModelCode());
      if (_.includes(['modelCode'], field)) {
         dispatch(residualValueStore.getDataResidualValue());
      }
   };

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setSelectedResidualValue([]);
      setImage(undefined);
      dispatch(residualValueStore.actions.setDataFilter(defaultValueFilterResidualValue));
      dispatch(residualValueStore.reloadModelCode());
      dispatch(residualValueStore.actions.resetListResidualValue());
   };

   //TODO: this should be dynamic, getting from apis
   const optionYearFilter = [
      { value: '2' },
      { value: '3' },
      { value: '4' },
      { value: '5' },
      { value: '6' },
      { value: '7' },
      { value: '8' },
      { value: '9' },
      { value: '10' },
   ];

   let heightComponentExcludingTable = 193;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');

   if (userRoleState === 'ADMIN') {
      heightComponentExcludingTable = 175;
   }
   useEffect(() => {
      setUserRoleState(userRole);
   });

   const showResidualValue = () => {
      selectedResidualValue.sort((n1, n2) => n1.id.hours - n2.id.hours);
      return selectedResidualValue.map((residualValue) => {
         const priceAfterResidualValue = residualValue.residualPercentage * dataFilter?.price;
         const formattedPriceAfterResidualValue =
            priceAfterResidualValue < Math.pow(10, 12)
               ? formatNumberTwoPercentDigit(priceAfterResidualValue)
               : priceAfterResidualValue.toPrecision(12);
         return (
            <Box sx={{ ...boxStyle, width: 200 }} key={residualValue.id}>
               <p style={{ fontWeight: 900, fontSize: 16, margin: 0 }}>
                  {residualValue.id.hours} hours
               </p>
               <Typography>{`${formatNumberTwoPercentDigit(residualValue.residualPercentage * 100)} %`}</Typography>
               {dataFilter?.price !== 0 && (
                  <Typography>{`$ ${formattedPriceAfterResidualValue}`}</Typography>
               )}
            </Box>
         );
      });
   };

   const handleChangeYear = (year: any) => {
      const newDataFilter = { ...dataFilter, year };
      dispatch(residualValueStore.actions.setDataFilter(newDataFilter));
      selectResidualValueByYears(year);
   };

   const selectResidualValueByYears = (years: string) => {
      setSelectedResidualValue(
         listResidualValue.filter((residualValue) => residualValue.id.yearOfUse == years)
      );
   };

   useEffect(() => {
      handleChangeYear(dataFilter.year);
      setImage(listResidualValue[0]?.id.product.image);
      convertTimezone();
   }, [listResidualValue]);

   useEffect(() => {
      convertTimezone();
   }, [serverLastUpdatedTime, serverTimeZone]);

   // show latest updated time
   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   const handleUploadResidualFile = async (file: File) => {
      dispatch(residualValueStore.uploadResidualValueFile(file));
   };

   return (
      <>
         <AppLayout entity="residualValue">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.modelType}
                     options={initDataFilterModelTypeAndBrand.modelTypes}
                     label={t('filters.modelType')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option?.value, 'modelType')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={1.2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.brand}
                     options={initDataFilterModelTypeAndBrand.brands}
                     label={t('filters.brand')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option?.value, 'brand')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={1} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.modelCode}
                     options={initDataFilterModelCode}
                     label={t('filters.model')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option?.value, 'modelCode')
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
                  <AppNumberField
                     value={dataFilter.price}
                     onChange={(e) => handleChangeDataFilter(Number(e.value), 'price')}
                     name="freightAdj"
                     label={`${t('table.averageSellingPrice')}`}
                     placeholder={`${t('table.averageSellingPrice')}`}
                     prefix="$"
                  />
               </Grid>

               <Grid item xs={1} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.year}
                     options={optionYearFilter}
                     label={t('filters.year')}
                     onChange={(e, option) => handleChangeYear(option.value)}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilters}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.clear')}
                  </Button>
               </Grid>
            </Grid>
            {userRoleState === 'ADMIN' && (
               <Grid
                  container
                  spacing={1}
                  sx={{ margin: '10px 0px', display: 'flex', alignItems: 'end', gap: 1 }}
               >
                  <UploadFileDropZone
                     handleUploadFile={handleUploadResidualFile}
                     buttonName="button.uploadResidual"
                     sx={{ padding: '0 30px' }}
                  />

                  <Typography
                     sx={{
                        color: 'blue',
                        fontSize: 5,

                        cursor: 'pointer',
                     }}
                     onClick={() => downloadFileByURL(exampleFile[RESIDUAL_VALUE])}
                  >
                     <GetAppIcon
                        sx={{
                           color: 'black',
                           marginTop: '2px',
                           fontSize: 'large',
                           '&:hover': { color: 'red' },
                        }}
                     />
                  </Typography>
               </Grid>
            )}

            <Grid
               container
               sx={{ height: `calc(100vh - ${heightComponentExcludingTable}px)`, marginTop: 2 }}
            >
               <Grid xs={5} sx={{ height: '100%' }}>
                  {/* Container image */}
                  <Box
                     sx={{
                        height: '80%',
                        border: '1px solid black',
                        marginTop: '5px',
                        borderRadius: '3px',
                        marginRight: '10px',
                     }}
                  >
                     {image !== undefined && (
                        <ProductImage
                           imageUrl={image}
                           style={{
                              objectFit: 'contain',
                              height: '100%',
                              width: '100%',
                           }}
                        />
                     )}
                  </Box>
                  <Typography variant="h5" align="center" sx={{ marginTop: '10px' }}>
                     ModelCode: {dataFilter.modelCode}
                  </Typography>
                  <Typography sx={{ bottom: '30px', position: 'absolute' }}>
                     {t('Last uploaded by')} {serverLastUpdatedBy} {t('table.lastUpdatedAt')}{' '}
                     {clientLatestUpdatedTime}
                  </Typography>
               </Grid>
               <Grid
                  xs={7}
                  sx={{
                     display: 'flex',
                     flexWrap: 'wrap',
                     alignContent: 'flex-start',
                     overflow: 'hidden',
                     overflowY: 'scroll',
                     height: `calc(100vh - ${heightComponentExcludingTable}px)`,
                  }}
               >
                  {
                     /* container residualValue */
                     showResidualValue()
                  }
               </Grid>
            </Grid>
         </AppLayout>
         <AppBackDrop open={loadingPage} hightHeaderTable={60} bottom={1} />
         <LogImportFailureDialog />
      </>
   );
}
