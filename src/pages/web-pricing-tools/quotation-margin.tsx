import { AppAutocomplete, AppLayout, AppNumberField, DataTable } from '@/components';

import _ from 'lodash';

import marginAnalysisApi from '@/api/marginAnalysis.api';
import CompareMarginDialog from '@/components/Dialog/Module/MarginHistoryDialog/CompareMarginDialog';
import { commonStore, marginAnalysisStore } from '@/store/reducers';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import {
   Button,
   CircularProgress,
   FormControlLabel,
   Paper,
   Radio,
   RadioGroup,
   styled,
   Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { formatNumberPercentage } from '@/utils/formatCell';
import { v4 as uuidv4 } from 'uuid';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

const StyledAppNumberField = styled(AppNumberField)(() => ({
   '& .MuiInputBase-input': {
      textAlign: 'end',
   },
}));
export default function MarginAnalysis() {
   const dispatch = useDispatch();
   const { t } = useTranslation();
   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');
   const currentYear = new Date().getFullYear();

   useEffect(() => {
      setUserRole(userRoleCookies);
   });

   const loading = useSelector(marginAnalysisStore.selectIsLoadingPage);
   const initDataFilter = useSelector(marginAnalysisStore.selectInitDataFilter);
   const dataFilter = useSelector(marginAnalysisStore.selectDataFilter);
   const fileUUID = useSelector(marginAnalysisStore.selectFileUUID);
   const marginCalculateData = useSelector(marginAnalysisStore.selectMarginData);
   const fileName = useSelector(marginAnalysisStore.selectFileName);
   const calculatedCurrency = useSelector(marginAnalysisStore.selectCurrency);
   const [additionalDiscount, setAdditionalDiscount] = useState(0);

   const handleUpdateDataFilterStore = (field: string, data: any) => {
      const newDataFilter = JSON.parse(JSON.stringify(dataFilter));

      newDataFilter[field] = data;
      if (field == 'orderNumber') {
         newDataFilter.type = null;
      }
      if (field == 'type') {
         newDataFilter.orderNumber = null;
      }

      dispatch(marginAnalysisStore.actions.setDataFilter(newDataFilter));
   };

   const handleCalculateMargin = async () => {
      try {
         if (!dataFilter.modelCode) {
            dispatch(
               commonStore.actions.setErrorMessage(t('commonErrorMessage.modelCodeNotSelected'))
            );
            return;
         }
         if (!dataFilter.series) {
            dispatch(
               commonStore.actions.setErrorMessage(t('commonErrorMessage.seriesNotSelected'))
            );
            return;
         }
         if (!dataFilter.orderNumber && !dataFilter.type) {
            dispatch(
               commonStore.actions.setErrorMessage(
                  t('commonErrorMessage.typeOrOrderNumberNotSelected')
               )
            );
            return;
         }

         const transformData = {
            marginData: {
               id: {
                  modelCode: dataFilter.modelCode,
                  type: !dataFilter.type ? 0 : dataFilter.type,
                  currency: dataFilter.currency,
               },

               fileUUID: fileUUID,
               orderNumber: !dataFilter.orderNumber ? '' : dataFilter.orderNumber,
               plant: 'SN',
               series: dataFilter.series,
               modelCode: dataFilter.modelCode,
            },
            region: dataFilter.region,
            subRegion: dataFilter.subRegion,
            delivery: dataFilter.delivery,
            additionalDiscount,
         };

         setLoading(true);

         const requestId = uuidv4();
         dispatch(marginAnalysisStore.actions.setRequestId(requestId));

         const { data } = await marginAnalysisApi.estimateMarginAnalystData(
            {
               ...transformData,
            },
            requestId
         );

         const analysisSummary = data?.MarginAnalystSummary;
         const marginAnalystData = data?.MarginAnalystData;

         marginAnalystData.forEach((margin) => {
            margin.discount = formatNumberPercentage(margin.discount * 100);
            margin.listPrice = margin.listPrice.toLocaleString();
            margin.manufacturingCost = margin.manufacturingCost.toLocaleString();
            margin.dealerNet = margin.dealerNet.toLocaleString();
         });

         const marginData = {
            targetMargin: data?.TargetMargin,
            listDataAnalysis: marginAnalystData,
            marginAnalysisSummary: analysisSummary,
         };

         dispatch(marginAnalysisStore.actions.setMarginData(marginData));
         dispatch(marginAnalysisStore.actions.setRequestId(undefined));
         dispatch(
            marginAnalysisStore.actions.setCurrency(data.MarginAnalystSummary.annually.id.currency)
         );

         setLoading(false);
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
         setLoading(false);
      }
   };

   const handleOpenMarginFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setLoading(true);

      dispatch(marginAnalysisStore.actions.resetFilter());

      marginAnalysisApi
         .checkFilePlant(formData)
         .then((response) => {
            setLoading(false);

            dispatch(marginAnalysisStore.actions.setFileUUID(response.data.fileUUID));

            const types = response.data.marginFilters.types;
            const modelCodes = response.data.marginFilters.modelCodes;
            const series = response.data.marginFilters.series;
            const orderNumbers = response.data.marginFilters.orderNumbers;

            const sortCharacter = (a, b) => {
               const nameA = a.value.toUpperCase(); // ignore upper and lowercase
               const nameB = b.value.toUpperCase(); // ignore upper and lowercase
               if (nameA < nameB) {
                  return -1;
               }
               if (nameA > nameB) {
                  return 1;
               }
               return 0;
            };

            types.sort((a, b) => a.value - b.value);
            modelCodes.sort((a, b) => sortCharacter(a, b));
            series.sort((a, b) => sortCharacter(a, b));
            orderNumbers.sort((a, b) => sortCharacter(a, b));

            const newInitDataFilter = { ...initDataFilter };
            newInitDataFilter.type = types;
            newInitDataFilter.modelCode = modelCodes;
            newInitDataFilter.series = series;
            newInitDataFilter.orderNumber = orderNumbers;

            dispatch(marginAnalysisStore.actions.setInitDataFilter(newInitDataFilter));
            // if (types.length !== 0) handleUpdateDataFilterStore('type', types[0].value);
         })
         .catch((error) => {
            setLoading(false);
            console.log(error);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleImportMacroFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setLoading(true);

      const requestId = uuidv4();
      dispatch(marginAnalysisStore.actions.setRequestId(requestId));

      marginAnalysisApi
         .importMacroFile(requestId, formData)
         .then((response) => {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage('Import successfully'));
         })
         .catch((error) => {
            setLoading(false);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleImportPowerBi = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setLoading(true);
      marginAnalysisApi
         .importPowerBiFile(formData)
         .then((response) => {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage('Import successfully'));
         })
         .catch((error) => {
            setLoading(false);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const getCurrencyForManufacturingCost = (data: any) => {
      return data?.fileUUID != null
         ? data?.plant == 'HYM' ||
           data?.plant == 'Ruyi' ||
           data?.plant == 'Staxx' ||
           data?.plant == 'Maximal'
            ? `${t('quotationMargin.manufacturingCost')} (RMB)`
            : `${t('quotationMargin.manufacturingCost')} (USD)`
         : `${t('quotationMargin.manufacturingCost')}`;
   };

   const columns = [
      {
         field: 'quoteNumber',
         flex: 0.5,
         minWidth: 150,
         headerName: 'Quote Number',
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return <span>{params.row.id.quoteNumber}</span>;
         },
      },
      {
         field: 'type',
         flex: 0.3,
         minWidth: 150,
         headerName: '#',
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return <span>{params.row.id.type}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.4,
         minWidth: 150,
         headerName: t('table.series'),
      },
      {
         field: 'modelCode',
         flex: 0.5,
         minWidth: 150,
         headerName: t('table.models'),
         align: 'left',
         renderCell(params) {
            return <span>{params.row.id.modelCode}</span>;
         },
      },
      {
         field: 'optionCode',
         flex: 0.4,
         minWidth: 150,
         headerName: t('table.partNumber'),
         renderCell(params) {
            return <span>{params.row.id.partNumber}</span>;
         },
      },
      {
         field: 'plant',
         flex: 0.3,
         minWidth: 150,
         headerName: t('table.plant'),
      },

      {
         field: 'listPrice',
         flex: 0.4,
         headerName: t('table.listPrice') + ` (${calculatedCurrency || ''})`,
         headerAlign: 'right',
         align: 'right',
         cellClassName: 'highlight-cell',
      },

      {
         field: 'discount',
         flex: 0.4,
         minWidth: 130,
         headerName: `${t('table.discount')} (%)`,
         headerAlign: 'right',
         align: 'right',
         cellClassName: 'highlight-cell',
      },

      {
         field: 'dealerNet',
         flex: 0.4,
         minWidth: 130,
         headerName: t('table.dealerNet'),
         headerAlign: 'right',
         align: 'right',
         cellClassName: 'highlight-cell',
      },

      {
         field: 'manufacturingCost',
         flex: 0.7,
         headerName: `${getCurrencyForManufacturingCost(marginCalculateData.marginAnalysisSummary?.monthly)}`, //+ ` (${dataFilter.currency})`,
         headerAlign: 'right',
         align: 'right',
      },
      {
         field: 'isSPED',
         flex: 0.6,
         minWidth: 150,
         headerName: 'SPED',
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return <span>{params.row.isSPED == true ? 'Yes' : 'No'}</span>;
         },
      },
   ];

   const getRowId = (row) => {
      const id = row.id;
      const quoteNumber = String(id.quoteNumber);
      const type = String(id.type);
      const modelCode = String(id.modelCode);
      const partNumber = String(id.partNumber);

      return quoteNumber + type + modelCode + partNumber;
   };

   const handleSaveData = async () => {
      if (marginCalculateData.marginAnalysisSummary == null) {
         dispatch(commonStore.actions.setErrorMessage('No data to save!'));
      } else {
         const transformedData = {
            annually: marginCalculateData.marginAnalysisSummary.annually,
            monthly: marginCalculateData.marginAnalysisSummary.monthly,
         };
         await marginAnalysisApi
            .saveMarginData(transformedData)
            .then((response) => {
               dispatch(commonStore.actions.setSuccessMessage(response.data.message));
            })
            .catch((error) => {
               dispatch(commonStore.actions.setErrorMessage(error.data.message));
            });
      }
   };

   const handleViewHistory = () => {
      handleOpenCompareMargin();
   };

   const [openCompareMargin, setOpenCompareMargin] = useState(false);
   const handleOpenCompareMargin = () => {
      setOpenCompareMargin(true);
   };
   const handleCloseCompareMargin = () => {
      setOpenCompareMargin(false);
   };

   const setLoading = (status: boolean) => {
      dispatch(marginAnalysisStore.actions.setLoadingPage(status));
   };

   const setFileName = (fileName: string) => {
      dispatch(marginAnalysisStore.actions.setFileName(fileName));
   };

   return (
      <>
         <AppLayout entity="not-refresh-data">
            {loading ? (
               <div
                  style={{
                     top: 60,
                     left: 0,
                     right: 0,
                     bottom: 0,
                     backgroundColor: 'rgba(0,0,0, 0.3)',
                     position: 'absolute',
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     zIndex: 1001,
                  }}
               >
                  <CircularProgress
                     color="info"
                     size={60}
                     sx={{
                        position: 'relative',
                     }}
                  />
               </div>
            ) : null}
            <Grid container spacing={1.1} display="flex" alignItems="center">
               <Grid item>
                  <UploadFileDropZone
                     handleUploadFile={handleOpenMarginFile}
                     buttonName={t('button.openFile')}
                     sx={{ width: '100%', height: 24 }}
                     setFileName={setFileName}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 140 }} xs={1}>
                  <AppAutocomplete
                     options={initDataFilter.modelCode}
                     label={t('filters.models')}
                     value={dataFilter.modelCode}
                     onChange={(e, option) =>
                        handleUpdateDataFilterStore('modelCode', option.value)
                     }
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 100 }} xs={0.5}>
                  <AppAutocomplete
                     options={initDataFilter.series}
                     label={t('filters.series')}
                     value={dataFilter.series}
                     onChange={(e, option) => handleUpdateDataFilterStore('series', option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     // error={series.error}
                     // helperText={'Please choose a Series to continue'}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 140 }} xs={1}>
                  <AppAutocomplete
                     options={initDataFilter?.orderNumber}
                     label={t('filters.order#')}
                     value={dataFilter.orderNumber}
                     onChange={(e, option) =>
                        handleUpdateDataFilterStore('orderNumber', option.value)
                     }
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item>{t('or')}</Grid>
               <Grid item sx={{ width: '10%', minWidth: 50 }} xs={0.5}>
                  <AppAutocomplete
                     options={initDataFilter?.type}
                     label="#"
                     value={dataFilter.type}
                     onChange={(e, option) => handleUpdateDataFilterStore('type', option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item sx={{ width: '10%', minWidth: 100 }} xs={0.8}>
                  <AppAutocomplete
                     options={initDataFilter.region}
                     label={t('filters.region')}
                     value={dataFilter.region}
                     onChange={(e, option) => handleUpdateDataFilterStore('region', option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               {dataFilter.region === 'Pacific' && (
                  <Grid item sx={{ width: '10%', minWidth: 140 }} xs={0.8}>
                     <AppAutocomplete
                        options={initDataFilter.subRegion}
                        //label={t('filters.subRegion')}
                        value={dataFilter.subRegion}
                        onChange={(e, option) =>
                           handleUpdateDataFilterStore('subRegion', option.value)
                        }
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                     />
                  </Grid>
               )}

               <Grid item>
                  <RadioGroup
                     row
                     value={dataFilter.currency}
                     onChange={(e) => handleUpdateDataFilterStore('currency', e.target.value)}
                     aria-labelledby="demo-row-radio-buttons-group-label"
                     name="row-radio-buttons-group"
                     sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginLeft: 1,
                     }}
                  >
                     <FormControlLabel value="USD" control={<Radio />} label="USD" />
                     <FormControlLabel value="AUD" control={<Radio />} label="AUD" />
                  </RadioGroup>
               </Grid>
               {dataFilter.region === 'Pacific' &&
                  dataFilter.subRegion === 'Australia' &&
                  dataFilter.currency === 'AUD' && (
                     <Grid item sx={{ width: '10%', minWidth: 80 }} xs={0.8}>
                        <AppAutocomplete
                           options={initDataFilter.delivery}
                           label={t('filters.delivery')}
                           value={dataFilter.delivery}
                           onChange={(e, option) =>
                              handleUpdateDataFilterStore('delivery', option.value)
                           }
                           disableListWrap
                           primaryKeyOption="value"
                           renderOption={(prop, option) => `${option.value}`}
                           getOptionLabel={(option) => `${option.value}`}
                        />
                     </Grid>
                  )}
               <Grid item>
                  <Button
                     variant="contained"
                     onClick={handleCalculateMargin}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.calculateData')}
                  </Button>
               </Grid>

               <Grid item>
                  <Typography fontSize={16}>
                     {t('button.fileUploaded')}: {fileName}
                  </Typography>
               </Grid>
               <Grid item sx={{ width: '10%' }} />

               {userRole === 'ADMIN' && (
                  <>
                     <Grid item spacing={1.1} display="flex" alignItems="center">
                        <Grid item>
                           <UploadFileDropZone
                              setFileName={setFileName}
                              handleUploadFile={handleImportMacroFile}
                              buttonName="Import Macro File"
                              sx={{ width: '100%', height: 24 }}
                           />

                           <UploadFileDropZone
                              setFileName={setFileName}
                              handleUploadFile={handleImportPowerBi}
                              buttonName="Import PowerBi File"
                              sx={{ width: '100%', height: 24, marginTop: 1 }}
                           />
                        </Grid>
                     </Grid>
                  </>
               )}
            </Grid>

            <Grid container spacing={1} sx={{ marginTop: 1 }}>
               <MarginPercentageAOPRateBox
                  data={marginCalculateData.marginAnalysisSummary?.annually}
                  valueCurrency={calculatedCurrency}
                  isAOPBox={true}
                  additionalDiscount={additionalDiscount}
                  setAdditionalDiscount={setAdditionalDiscount}
                  handleCaclulate={handleCalculateMargin}
               />
               <MarginPercentageAOPRateBox
                  data={marginCalculateData.marginAnalysisSummary?.monthly}
                  valueCurrency={calculatedCurrency}
                  additionalDiscount={additionalDiscount}
                  setAdditionalDiscount={setAdditionalDiscount}
                  handleCaclulate={handleCalculateMargin}
               />
               <Grid item xs={4}>
                  <Paper elevation={3} sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}>
                     <div className="space-between-element">
                        <Typography
                           sx={{ fontWeight: 'bold', marginLeft: 1 }}
                           variant="body1"
                           component="span"
                        >
                           AOP {currentYear}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <br />
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('filters.region')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {dataFilter.region}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('filters.series')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {dataFilter.series}
                        </Typography>
                     </div>
                     <div
                        className="space-between-element"
                        style={{
                           backgroundColor: '#e7a800',
                           border: '1px solid #e7a800',
                           borderRadius: 10,
                        }}
                     >
                        <Typography
                           variant="body1"
                           component="span"
                           sx={{ fontWeight: 'bold', marginLeft: 1 }}
                        >
                           {t('quotationMargin.targetMarginPercentage')}
                        </Typography>
                        <Typography
                           variant="body1"
                           component="span"
                           sx={{ fontWeight: 'bold', marginRight: 1 }}
                        >
                           {formatNumberPercentage(marginCalculateData.targetMargin * 100)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>

               <FullCostAOPRateBox
                  data={marginCalculateData.marginAnalysisSummary?.annually}
                  valueCurrency={calculatedCurrency}
               />
               <FullCostAOPRateBoxMonthly
                  data={marginCalculateData.marginAnalysisSummary?.monthly}
                  valueCurrency={calculatedCurrency}
               />

               <Grid item xs={4}>
                  <Grid>
                     <Button
                        variant="contained"
                        onClick={handleSaveData}
                        sx={{ width: '25%', height: 24, minWidth: 130 }}
                     >
                        Save
                     </Button>
                  </Grid>

                  <Grid>
                     <Button
                        variant="contained"
                        onClick={handleViewHistory}
                        sx={{ width: '25%', height: 24, marginTop: 1, minWidth: 130 }}
                     >
                        Compare Margin
                     </Button>
                  </Grid>
               </Grid>

               <ForUSPricingBox
                  data={marginCalculateData.marginAnalysisSummary?.annually}
                  title={t('quotationMargin.forUSPricing')}
               />
               <ForUSPricingBox
                  data={marginCalculateData.marginAnalysisSummary?.monthly}
                  title={t('quotationMargin.forUSPricing')}
               />
            </Grid>

            <Grid container sx={{ marginTop: 1 }}>
               <DataTable
                  hideFooter
                  disableColumnMenu
                  tableHeight={250}
                  rowHeight={50}
                  rows={marginCalculateData.listDataAnalysis}
                  columns={columns}
                  getRowId={getRowId}
                  sx={{ borderBottom: '1px solid #a8a8a8', borderTop: '1px solid #a8a8a8' }}
               />
            </Grid>
         </AppLayout>
         <CompareMarginDialog open={openCompareMargin} onClose={handleCloseCompareMargin} />
      </>
   );
}

const MarginPercentageAOPRateBox = (props) => {
   const { t } = useTranslation();
   const {
      data,
      valueCurrency,
      isAOPBox,
      additionalDiscount,
      setAdditionalDiscount,
      handleCaclulate,
   } = props;
   return (
      <Grid item xs={4}>
         <Paper elevation={3} sx={{ padding: 2, height: 'fit-content' }}>
            <div className="space-between-element">
               <Typography
                  sx={{ fontWeight: 'bold', marginLeft: 1 }}
                  variant="body1"
                  component="span"
               >
                  {`${t('quotationMargin.totalListPrice')} `}
                  {valueCurrency ? `(${valueCurrency})` : ''}
               </Typography>
               <Typography
                  sx={{ fontWeight: 'bold', marginRight: 1 }}
                  variant="body1"
                  component="span"
               >
                  {data?.totalListPrice.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {t('quotationMargin.blendedDiscountPercentage')}
               </Typography>
               <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                  {_.isNil(data?.blendedDiscountPercentage)
                     ? ''
                     : `${(data?.blendedDiscountPercentage * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element" style={{ alignItems: 'center' }}>
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {t('quotationMargin.additionalDiscountPercentage')}
               </Typography>
               <StyledAppNumberField
                  value={additionalDiscount}
                  sx={{ maxWidth: '100px', textAlign: 'end' }}
                  onChange={(e) => setAdditionalDiscount(e.value)}
                  suffix="%"
                  onPressEnter={handleCaclulate}
                  debounceDelay={0.05}
               />
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {`${t('quotationMargin.dealerNet')}`} {valueCurrency ? `(${valueCurrency})` : ''}
               </Typography>
               <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                  {data?.dealerNet.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {t('quotationMargin.margin')}
               </Typography>
               <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                  {data?.margin.toLocaleString()}
               </Typography>
            </div>
            <div
               className="space-between-element"
               style={{
                  backgroundColor: '#e7a800',
                  border: '1px solid #e7a800',
                  borderRadius: 10,
               }}
            >
               <Typography
                  variant="body1"
                  component="span"
                  sx={{ fontWeight: 'bold', marginLeft: 1 }}
               >
                  {isAOPBox
                     ? t('quotationMargin.marginPercentageAOPRate')
                     : t('quotationMargin.marginPercentageMonthlyRate')}{' '}
               </Typography>
               <Typography
                  variant="body1"
                  component="span"
                  sx={{ fontWeight: 'bold', marginRight: 1 }}
               >
                  {_.isNil(data?.marginPercentageAOPRate)
                     ? ''
                     : `${(data?.marginPercentageAOPRate * 100).toFixed(2)}%`}
               </Typography>
            </div>
         </Paper>
      </Grid>
   );
};

const FullCostAOPRateBox = (props) => {
   const { t } = useTranslation();
   const { data, valueCurrency } = props;

   return (
      <Grid item xs={4}>
         <Paper
            elevation={2}
            sx={{
               padding: 2,
               height: 'fit-content',
            }}
         >
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {t('quotationMargin.marginAnalysisAOPRate')}
               </Typography>
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {data?.marginAOPRate.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {data?.plant == 'HYM' ||
                  data?.plant == 'Ruyi' ||
                  data?.plant == 'Staxx' ||
                  data?.plant == 'Maximal'
                     ? `${t('quotationMargin.manufacturingCost')} (RMB)`
                     : data?.plant == 'SN'
                       ? `${t('quotationMargin.manufacturingCost')} (USD)`
                       : `${t('quotationMargin.manufacturingCost')}`}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.totalManufacturingCost.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.costUplift')}{' '}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.costUplift) ? '' : `${(data?.costUplift * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.addWarranty')}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.addWarranty) ? '' : `${(data?.addWarranty * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.surcharge')}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.surcharge) ? '' : `${(data?.surcharge * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.duty')} (AU BT Only)
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.duty) ? '' : `${(data?.duty * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.freight')} (AU Only)
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.freight}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.liIonIncluded')}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.liIonIncluded) ? '' : data?.liIonIncluded ? 'Yes' : 'No'}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {data?.fileUUID != null
                     ? data?.plant == 'HYM' ||
                       data?.plant == 'Ruyi' ||
                       data?.plant == 'Staxx' ||
                       data?.plant == 'Maximal'
                        ? `${t('quotationMargin.totalCost')} (RMB)`
                        : `${t('quotationMargin.totalCost')} (USD)`
                     : `${t('quotationMargin.totalCost')}`}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.totalCost.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {`${t('quotationMargin.AOPExchangeRate')} ${valueCurrency || ''}`}
               </Typography>
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {data?.fullCostAOPRate.toLocaleString()}
               </Typography>
            </div>
         </Paper>
      </Grid>
   );
};

const FullCostAOPRateBoxMonthly = (props) => {
   const { t } = useTranslation();
   const { data, valueCurrency } = props;

   return (
      <Grid item xs={4}>
         <Paper
            elevation={2}
            sx={{
               padding: 2,
               height: 'fit-content',
            }}
         >
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {t('quotationMargin.marignAnalysisMonthlyRate')}
               </Typography>
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {data?.marginAOPRate.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {data?.plant == 'HYM' ||
                  data?.plant == 'Ruyi' ||
                  data?.plant == 'Staxx' ||
                  data?.plant == 'Maximal'
                     ? `${t('quotationMargin.manufacturingCost')} (RMB)`
                     : data?.plant == 'SN'
                       ? `${t('quotationMargin.manufacturingCost')} (USD)`
                       : `${t('quotationMargin.manufacturingCost')}`}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.totalManufacturingCost.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.costUplift')}{' '}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.costUplift) ? '' : `${(data?.costUplift * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.addWarranty')}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.addWarranty) ? '' : `${(data?.addWarranty * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.surcharge')}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.surcharge) ? '' : `${(data?.surcharge * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.duty')} (AU BT Only)
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.duty) ? '' : `${(data?.duty * 100).toFixed(2)}%`}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.freight')} (AU Only)
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.freight}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.liIonIncluded')}
               </Typography>
               <Typography variant="body1" component="span">
                  {_.isNil(data?.liIonIncluded) ? '' : data?.liIonIncluded ? 'Yes' : 'No'}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {data?.fileUUID != null
                     ? data?.plant == 'HYM' ||
                       data?.plant == 'Ruyi' ||
                       data?.plant == 'Staxx' ||
                       data?.plant == 'Maximal'
                        ? `${t('quotationMargin.totalCost')} (RMB)`
                        : `${t('quotationMargin.totalCost')} (USD)`
                     : `${t('quotationMargin.totalCost')}`}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.totalCost.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {`${t('quotationMargin.monthlyExchangeRate')} ${valueCurrency || ''}`}
               </Typography>
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {data?.fullCostAOPRate.toLocaleString()}
               </Typography>
            </div>
         </Paper>
      </Grid>
   );
};

const ForUSPricingBox = (props) => {
   const { t } = useTranslation();
   const { data, title } = props;

   return (
      <Grid item xs={4}>
         <Paper elevation={3} sx={{ padding: 2, height: 'fit-content' }}>
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {title}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.manufacturingCost')}
                  {data?.id?.currency ? ` (${data?.id?.currency})` : ''}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.manufacturingCostUSD.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.addWarranty')}
                  {data?.id?.currency ? ` (${data?.id?.currency})` : ''}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.warrantyCost.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.surcharge')}
                  {data?.id?.currency ? ` (${data?.id?.currency})` : ''}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.surchargeCost.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.totalCost')} {t('quotationMargin.excludingFreight')}
                  {data?.id?.currency ? ` (${data?.id?.currency})` : ''}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.totalCostWithoutFreight.toLocaleString()}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.totalCost')} {t('quotationMargin.withFreight')}
                  {data?.id?.currency ? ` (${data?.id?.currency})` : ''}
               </Typography>
               <Typography variant="body1" component="span">
                  {data?.totalCostWithFreight.toLocaleString()}
               </Typography>
            </div>
         </Paper>
      </Grid>
   );
};

function UploadFileDropZone(props) {
   const onDrop = useCallback((acceptedFiles) => {
      acceptedFiles.forEach((file) => {
         const reader = new FileReader();

         reader.onabort = () => console.log('file reading was aborted');
         reader.onerror = () => console.log('file reading has failed');
         reader.onload = () => {
            // Do whatever you want with the file contents
            props.setFileName(file.name);
         };
         reader.readAsArrayBuffer(file);
         props.handleUploadFile(file);
      });
   }, []);

   const { getRootProps, getInputProps, open, fileRejections } = useDropzone({
      noClick: true,
      onDrop,
      maxSize: 50777216,
      maxFiles: 1,
      accept: {
         'excel/xlsx': ['.xlsx', '.xlsb'],
      },
   });
   const dispatch = useDispatch();
   const isFileInvalid = fileRejections.length > 0 ? true : false;
   if (isFileInvalid) {
      const errors = fileRejections[0].errors;
      dispatch(
         commonStore.actions.setErrorMessage(
            `${errors[0].message} ${_.isNil(errors[1]) ? '' : `or ${errors[1].message}`}`
         )
      );
      fileRejections.splice(0, 1);
   }

   return (
      <div {...getRootProps()}>
         <input {...getInputProps()} />
         <Button type="button" onClick={open} variant="contained" sx={props.sx}>
            {props.buttonName}
         </Button>
      </div>
   );
}
