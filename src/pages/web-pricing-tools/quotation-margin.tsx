import { AppAutocomplete, AppLayout, AppTextField, DataTable } from '@/components';

import _ from 'lodash';

import Grid from '@mui/material/Grid';
import {
   Button,
   FormControlLabel,
   Paper,
   Radio,
   RadioGroup,
   Typography,
   CircularProgress,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import marginAnalysisApi from '@/api/marginAnalysis.api';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import { parseCookies, setCookie } from 'nookies';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}
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

   const [valueCurrency, setValueCurrency] = useState('USD');
   const handleChange = (event) => {
      setValueCurrency(event.target.value);
   };

   const [listDataAnalysis, setListDataAnalysis] = useState([]);
   const [marginAnalysisSummary, setMarginAnalysisSummary] = useState(null);
   const [uploadedFile, setUploadedFile] = useState({ name: '' });
   const [loading, setLoading] = useState(false);

   const [typeValue, setTypeValue] = useState({ value: 'None', error: false });
   const handleTypeValue = (option) => {
      setTypeValue({ value: option, error: false });
      if (option != 'None') setOrderNumberValue({ value: 'None' });
   };

   const [orderNumberValue, setOrderNumberValue] = useState({ value: 'None' });
   const handleOrderNumber = (option) => {
      setOrderNumberValue({ value: option });
      if (option != 'None') setTypeValue({ value: 'None', error: false });
   };

   const [series, setSeries] = useState({ value: '', error: false });
   const handleSeriesValue = (option) => {
      setSeries({ value: option, error: false });
   };

   const [regionValue, setRegionValue] = useState({ value: 'Asia' });
   const handleChangeRegionOptions = (option) => {
      setRegionValue({ value: option.value });
   };

   const [modelCodeValue, setModelCodeValue] = useState({ value: 'None' });
   const handleChangeModelCodeValue = (option) => {
      setModelCodeValue({ value: option });
   };

   const [targetMargin, setTargetMargin] = useState(0);

   const handleCalculateMargin = async () => {
      try {
         if (series.value == 'None') {
            setSeries({ value: 'None', error: true });
            return;
         }

         const transformData = {
            marginData: {
               modelCode: modelCodeValue.value == 'None' ? '' : modelCodeValue.value,
               type: typeValue.value == 'None' ? 0 : typeValue.value,
               currency: valueCurrency,
               fileUUID: cookies['fileUUID'],
               orderNumber: orderNumberValue.value == 'None' ? '' : orderNumberValue.value,
               plant: 'SN',
               series: series.value,
            },
            region: regionValue.value,
         };

         setLoading(true);
         const { data } = await marginAnalysisApi.estimateMarginAnalystData({
            ...transformData,
         });

         const analysisSummary = data?.MarginAnalystSummary;
         const marginAnalystData = data?.MarginAnalystData;

         marginAnalystData.forEach((margin) => {
            margin.listPrice = margin.listPrice.toLocaleString();
            margin.manufacturingCost = margin.manufacturingCost.toLocaleString();
            margin.dealerNet = margin.dealerNet.toLocaleString();
            margin.margin_aop = margin.margin_aop.toLocaleString();
         });

         setMarginAnalysisSummary(analysisSummary);
         setListDataAnalysis(marginAnalystData);

         setTargetMargin(data?.TargetMargin);
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

      marginAnalysisApi
         .checkFilePlant(formData)
         .then((response) => {
            setLoading(false);
            setCookie(null, 'fileUUID', response.data.fileUUID);

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

            setMarginFilter({
               type: [{ value: 'None' }, ...types],
               modelCode: [{ value: 'None' }, ...modelCodes],
               series: series,
               orderNumber: [{ value: 'None' }, ...orderNumbers],
            });
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

      marginAnalysisApi
         .importMacroFile(formData)
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

   const columns = [
      {
         field: 'type',
         flex: 0.8,
         headerName: '#',
         headerAlign: 'center',
         align: 'center',
      },
      {
         field: 'modelCode',
         flex: 0.8,
         headerName: t('table.models'),
         align: 'left',
      },
      {
         field: 'optionCode',
         flex: 0.8,
         headerName: t('table.partNumber'),
      },
      {
         field: 'series',
         flex: 0.8,
         headerName: t('table.series'),
      },
      {
         field: 'plant',
         flex: 0.8,
         headerName: t('table.plant'),
      },
      {
         field: 'listPrice',
         flex: 0.4,
         headerName: t('table.listPrice'),
         headerAlign: 'right',
         align: 'right',
         cellClassName: 'highlight-cell',
      },
      {
         field: 'manufacturingCost',
         flex: 0.8,
         headerName: t('quotationMargin.manufacturingCost'),
         headerAlign: 'right',
         align: 'right',
      },
      {
         field: 'dealerNet',
         flex: 0.4,
         headerName: t('table.dealerNet'),
         headerAlign: 'right',
         align: 'right',
         cellClassName: 'highlight-cell',
      },
      {
         field: 'isSPED',
         flex: 0.8,
         headerName: 'SPED',
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return <span>{params.row.isSPED == true ? 'Yes' : 'No'}</span>;
         },
      },
   ];

   const [marginFilter, setMarginFilter] = useState({
      type: [{ value: 'None' }],
      modelCode: [{ value: 'None' }],
      series: [{ value: 'None' }],
      orderNumber: [{ value: 'None' }],
   });

   useEffect(() => {
      setTypeValue({ value: marginFilter.type[0]?.value, error: false });
      setModelCodeValue({ value: marginFilter.modelCode[0]?.value });
      setSeries({ value: marginFilter.series[0]?.value, error: false });
      setOrderNumberValue({ value: marginFilter.orderNumber[0]?.value });
   }, [marginFilter]);

   const regionOptions = [
      {
         value: 'Asia',
      },
      {
         value: 'Australia',
      },
      {
         value: 'India',
      },
      {
         value: 'Pacific',
      },
   ];

   return (
      <>
         <AppLayout entity="margin_analysis">
            {loading ? (
               <div
                  style={{
                     top: 0,
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
                     uploadedFile={uploadedFile}
                     setUploadedFile={setUploadedFile}
                     handleUploadFile={handleOpenMarginFile}
                     buttonName={t('button.openFile')}
                     sx={{ width: '100%', height: 24 }}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 140 }} xs={1}>
                  <AppAutocomplete
                     options={marginFilter.modelCode}
                     label={t('filters.models')}
                     value={modelCodeValue}
                     onChange={(e, option) => handleChangeModelCodeValue(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 100 }} xs={0.5}>
                  <AppAutocomplete
                     options={marginFilter.series}
                     label={t('filters.series')}
                     value={series}
                     onChange={(e, option) => handleSeriesValue(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     required
                     error={series.error}
                     helperText={'Please choose a Series to continue'}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 140 }} xs={1}>
                  <AppAutocomplete
                     options={marginFilter.orderNumber}
                     label={t('filters.order#')}
                     value={orderNumberValue}
                     onChange={(e, option) => handleOrderNumber(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item>{t('or')}</Grid>
               <Grid item sx={{ width: '10%', minWidth: 50 }} xs={0.5}>
                  <AppAutocomplete
                     options={marginFilter.type}
                     label="#"
                     value={typeValue}
                     onChange={(e, option) => handleTypeValue(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item sx={{ width: '10%', minWidth: 100 }} xs={0.8}>
                  <AppAutocomplete
                     options={regionOptions}
                     label={t('filters.region')}
                     value={regionValue.value}
                     onChange={(e, option) => handleChangeRegionOptions(option)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item>
                  <RadioGroup
                     row
                     value={valueCurrency}
                     onChange={handleChange}
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
                     {t('button.fileUploaded')}: {uploadedFile.name}
                  </Typography>
               </Grid>
               <Grid item sx={{ width: '10%' }} />

               {userRole === 'ADMIN' && (
                  <>
                     <Grid item spacing={1.1} display="flex" alignItems="center">
                        <Grid item>
                           <UploadFileDropZone
                              uploadedFile={uploadedFile}
                              setUploadedFile={setUploadedFile}
                              handleUploadFile={handleImportMacroFile}
                              buttonName="Import Macro File"
                              sx={{ width: '100%', height: 24 }}
                           />

                           <UploadFileDropZone
                              uploadedFile={uploadedFile}
                              setUploadedFile={setUploadedFile}
                              handleUploadFile={handleImportPowerBi}
                              buttonName="Import PowerBi File"
                              sx={{ width: '100%', height: 24, marginTop: 1 }}
                           />
                        </Grid>
                     </Grid>
                  </>
               )}
            </Grid>

            <Grid container sx={{ marginTop: 1 }}>
               <DataTable
                  hideFooter
                  disableColumnMenu
                  tableHeight={250}
                  rowHeight={50}
                  rows={listDataAnalysis}
                  columns={columns}
                  sx={{ borderBottom: '1px solid #a8a8a8', borderTop: '1px solid #a8a8a8' }}
               />
            </Grid>

            <Grid container spacing={1} sx={{ marginTop: 1 }}>
               <Grid item xs={4}>
                  <Paper elevation={3} sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}>
                     <div className="space-between-element">
                        <Typography
                           sx={{ fontWeight: 'bold', marginLeft: 1 }}
                           variant="body1"
                           component="span"
                        >
                           {`${t('quotationMargin.totalListPrice')} (${valueCurrency})`}
                        </Typography>
                        <Typography
                           sx={{ fontWeight: 'bold', marginRight: 1 }}
                           variant="body1"
                           component="span"
                        >
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalListPrice.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('quotationMargin.blendedDiscountPercentage')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {_.isNil(
                              marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                 .blendedDiscountPercentage
                           )
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                      .blendedDiscountPercentage * 100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {`${t('quotationMargin.dealerNet')} (${valueCurrency})`}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.dealerNet.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('quotationMargin.margin')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.margin.toLocaleString()}
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
                           {t('quotationMargin.marginPercentageAOPRate')}{' '}
                        </Typography>
                        <Typography
                           variant="body1"
                           component="span"
                           sx={{ fontWeight: 'bold', marginRight: 1 }}
                        >
                           {_.isNil(
                              marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                 .marginPercentAopRate
                           )
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                      .marginPercentAopRate * 100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={4}>
                  <Paper elevation={3} sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}>
                     <div className="space-between-element">
                        <Typography
                           sx={{ fontWeight: 'bold', marginLeft: 1 }}
                           variant="body1"
                           component="span"
                        >
                           {`${t('quotationMargin.totalListPrice')} (${valueCurrency})`}
                        </Typography>
                        <Typography
                           sx={{ fontWeight: 'bold', marginRight: 1 }}
                           variant="body1"
                           component="span"
                        >
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalListPrice.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('quotationMargin.blendedDiscountPercentage')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {_.isNil(
                              marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                 .blendedDiscountPercentage
                           )
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                      .blendedDiscountPercentage * 100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {`${t('quotationMargin.dealerNet')} (${valueCurrency})`}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.dealerNet.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('quotationMargin.margin')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.margin.toLocaleString()}
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
                           {t('quotationMargin.marginPercentageAOPRate')}
                        </Typography>
                        <Typography
                           variant="body1"
                           component="span"
                           sx={{ fontWeight: 'bold', marginRight: 1 }}
                        >
                           {_.isNil(
                              marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                 .marginPercentMonthlyRate
                           )
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                      .marginPercentMonthlyRate * 100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
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
                           {regionValue.value}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                           {t('filters.series')}
                        </Typography>
                        <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                           {series.value}
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
                           {targetMargin * 100}%
                        </Typography>
                     </div>
                  </Paper>
               </Grid>

               <Grid item xs={4}>
                  <Paper
                     elevation={2}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: 300,
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('quotationMargin.marginAnalysisAOPRate')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.marginAopRate.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.costUplift')}{' '}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryAnnually.costUplift)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryAnnually.costUplift *
                                   100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant == 'HYM' ||
                           marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant == 'Ruyi' ||
                           marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant == 'Staxx' ||
                           marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant == 'Maximal'
                              ? `${t('quotationMargin.manufacturingCost')} (RMB)`
                              : marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant == 'SN'
                              ? `${t('quotationMargin.manufacturingCost')} (USD)`
                              : `${t('quotationMargin.manufacturingCost')} (${valueCurrency})`}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalManufacturingCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.addWarranty')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryAnnually.addWarranty)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryAnnually.addWarranty *
                                   100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.surcharge')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryAnnually.surcharge)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryAnnually.surcharge *
                                   100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.duty')} (AU BT Only)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryAnnually.duty)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryAnnually.duty * 100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.freight')} (AU Only)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.freight}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.liIonIncluded')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(
                              marginAnalysisSummary?.MarginAnalystSummaryAnnually.liIonIncluded
                           )
                              ? ''
                              : marginAnalysisSummary?.MarginAnalystSummaryAnnually.liIonIncluded
                              ? 'Yes'
                              : 'No'}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.fileUUID != null
                              ? marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'HYM' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Ruyi' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Staxx' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Maximal'
                                 ? `${t('quotationMargin.totalCost')} (RMB)`
                                 : `${t('quotationMargin.totalCost')} (USD)`
                              : `${t('quotationMargin.totalCost')} (${valueCurrency})`}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {`${t('quotationMargin.fullCost')} ${valueCurrency} @AOP Rate`}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.fullCostAopRate.toLocaleString()}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={4}>
                  <Paper
                     elevation={3}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: 300,
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('quotationMargin.marignAnalysisMonthlyRate')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.marginAopRate.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.costUplift')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryMonthly.costUplift)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryMonthly.costUplift *
                                   100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.fileUUID != null
                              ? marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'HYM' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Ruyi' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Staxx' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Maximal'
                                 ? `${t('quotationMargin.manufacturingCost')} (RMB)`
                                 : `${t('quotationMargin.manufacturingCost')} (USD)`
                              : `${t('quotationMargin.manufacturingCost')} (${valueCurrency})`}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalManufacturingCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.addWarranty')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryMonthly.addWarranty)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryMonthly.addWarranty *
                                   100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.surcharge')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryMonthly.surcharge)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryMonthly.surcharge *
                                   100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.duty')} (AU BT Only)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(marginAnalysisSummary?.MarginAnalystSummaryMonthly.duty)
                              ? ''
                              : `${(
                                   marginAnalysisSummary?.MarginAnalystSummaryMonthly.duty * 100
                                ).toFixed(2)}%`}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.freight')} (AU Only)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.freight}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.liIonIncluded')}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {_.isNil(
                              marginAnalysisSummary?.MarginAnalystSummaryMonthly.liIonIncluded
                           )
                              ? ''
                              : marginAnalysisSummary?.MarginAnalystSummaryMonthly.liIonIncluded
                              ? 'Yes'
                              : 'No'}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.fileUUID != null
                              ? marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'HYM' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Ruyi' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Staxx' ||
                                marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                   'Maximal'
                                 ? `${t('quotationMargin.totalCost')} (RMB)`
                                 : `${t('quotationMargin.totalCost')} (USD)`
                              : `${t('quotationMargin.totalCost')} (${valueCurrency})`}
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {`${t('quotationMargin.fullCost')} ${valueCurrency} @AOP Rate`}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.fullMonthlyRate.toLocaleString()}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>

               <Grid item xs={4}></Grid>
               <Grid item xs={4}>
                  <Paper elevation={3} sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           For US Pricing @ AOP rate
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.manufacturingCost')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.manufacturingCostUSD.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.addWarranty')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.warrantyCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.surcharge')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.surchargeCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.totalCost')} {t('quotationMargin.excludingFreight')}{' '}
                           (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalCostWithoutFreight.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.totalCost')} {t('quotationMargin.withFreight')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalCostWithFreight.toLocaleString()}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={4}>
                  <Paper elevation={3} sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           For US Pricing @ AOP rate
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.manufacturingCost')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.manufacturingCostUSD.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.addWarranty')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.warrantyCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.surcharge')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.surchargeCost.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.totalCost')} {t('quotationMargin.excludingFreight')}{' '}
                           (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalCostWithoutFreight.toLocaleString()}
                        </Typography>
                     </div>
                     <div className="space-between-element">
                        <Typography variant="body1" component="span">
                           {t('quotationMargin.totalCost')} {t('quotationMargin.withFreight')} (USD)
                        </Typography>
                        <Typography variant="body1" component="span">
                           {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalCostWithFreight.toLocaleString()}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
            </Grid>
         </AppLayout>
      </>
   );
}

function UploadFileDropZone(props) {
   const onDrop = useCallback((acceptedFiles) => {
      acceptedFiles.forEach((file) => {
         const reader = new FileReader();

         reader.onabort = () => console.log('file reading was aborted');
         reader.onerror = () => console.log('file reading has failed');
         reader.onload = () => {
            // Do whatever you want with the file contents
            props.setUploadedFile(file);
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
