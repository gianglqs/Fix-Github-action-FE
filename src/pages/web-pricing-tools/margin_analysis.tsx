import { AppAutocomplete, AppLayout, AppTextField, DataTable } from '@/components';

import _ from 'lodash';

import Grid from '@mui/material/Grid';
import {
   Accordion,
   AccordionDetails,
   AccordionSummary,
   Button,
   FormControlLabel,
   Paper,
   Radio,
   RadioGroup,
   Typography,
   CircularProgress,
} from '@mui/material';
import { GridExpandMoreIcon } from '@mui/x-data-grid-pro';
import { useCallback, useEffect, useState } from 'react';
import marginAnalysisApi from '@/api/marginAnalysis.api';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import { parseCookies, setCookie } from 'nookies';
import axios from 'axios';

export async function getServerSideProps(context) {
   try {
      let cookies = parseCookies(context);
      let token = cookies['token'];
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkToken`, null, {
         headers: {
            Authorization: 'Bearer ' + token,
         },
      });

      return {
         props: {},
      };
   } catch (error) {
      console.error('token error', error);

      return {
         redirect: {
            destination: '/login',
            permanent: false,
         },
      };
   }
}
export default function MarginAnalysis() {
   const dispatch = useDispatch();
   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   useEffect(() => {
      setUserRole(userRoleCookies);
   });

   const [valueCurrency, setValueCurrency] = useState('USD');
   const handleChange = (event) => {
      setValueCurrency(event.target.value);
   };

   const [listDataAnalysis, setListDataAnalysis] = useState([]);
   const [marginAnalysisSummary, setMarginAnalysisSummary] = useState(null);
   const [openAccordion, setOpenAccordion] = useState(true);
   const [openAccordionTable, setOpenAccordionTable] = useState(true);
   const [uploadedFile, setUploadedFile] = useState({ name: '' });
   const [loading, setLoading] = useState(false);

   const [typeValue, setTypeValue] = useState({ value: 'None', error: false });
   const handleTypeValue = (option) => {
      setTypeValue({ value: option, error: false });
   };

   const [orderNumberValue, setOrderNumberValue] = useState({ value: 'None' });
   const handleOrderNumber = (option) => {
      setOrderNumberValue({ value: option });
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

         setOpenAccordion(true);
         setOpenAccordionTable(true);
         setLoading(false);
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
         setLoading(false);
      }
   };

   const handleOpenMarginFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      let token = cookies['token'];
      setLoading(true);

      axios({
         method: 'post',
         url: `${process.env.NEXT_PUBLIC_BACKEND_URL}marginData/readNOVOFile`,
         data: formData,
         headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
         },
      })
         .then(function (response) {
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
         .catch(function (response) {
            setLoading(false);
            console.log(response);
            dispatch(commonStore.actions.setErrorMessage(response.response.data.message));
         });
   };
   const handleImportMacroFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      let token = cookies['token'];
      setLoading(true);
      axios({
         method: 'post',
         url: `${process.env.NEXT_PUBLIC_BACKEND_URL}importMacroFile`,
         data: formData,
         headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
         },
      })
         .then(function (response) {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage('Import successfully'));
         })
         .catch(function (response) {
            setLoading(false);
            dispatch(commonStore.actions.setErrorMessage());
         });
   };

   const handleImportPowerBi = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      let token = cookies['token'];
      setLoading(true);
      axios({
         method: 'post',
         url: `${process.env.NEXT_PUBLIC_BACKEND_URL}importPowerBiFile`,
         data: formData,
         headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + token,
         },
      })
         .then(function (response) {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage('Import successfully'));
         })
         .catch(function (response) {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage(response.response.data.message));
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
         headerName: 'Model Code',
         align: 'left',
      },
      {
         field: 'optionCode',
         flex: 0.8,
         headerName: 'Part #',
      },
      {
         field: 'series',
         flex: 0.8,
         headerName: 'Series',
      },
      {
         field: 'plant',
         flex: 0.8,
         headerName: 'Plant',
      },
      {
         field: 'listPrice',
         flex: 0.8,
         headerName: 'List Price',
         headerAlign: 'right',
         align: 'right',
      },
      {
         field: 'manufacturingCost',
         flex: 0.8,
         headerName: 'Manufacturing Cost',
         headerAlign: 'right',
         align: 'right',
      },
      {
         field: 'dealerNet',
         flex: 0.8,
         headerName: 'DN',
         headerAlign: 'right',
         align: 'right',
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
      type: [],
      modelCode: [],
      series: [],
      orderNumber: [],
   });

   useEffect(() => {
      console.log(marginFilter);
      setTypeValue({ value: marginFilter.type[0]?.value, error: false });
      setModelCodeValue({ value: marginFilter.modelCode[0]?.value });
      setSeries({ value: marginFilter.series[0]?.value, error: false });
      setOrderNumberValue({ value: marginFilter.orderNumber[0]?.value });

      console.log(typeValue, modelCodeValue, series, orderNumberValue);
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
                     buttonName="Open File"
                     sx={{ width: '100%', height: 24 }}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 50 }} xs={0.5}>
                  <AppAutocomplete
                     options={marginFilter.type}
                     label="#"
                     value={typeValue.value}
                     onChange={(e, option) => handleTypeValue(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 140 }} xs={1}>
                  <AppAutocomplete
                     options={marginFilter.modelCode}
                     label="Model Code"
                     value={modelCodeValue.value}
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
                     label="Series"
                     value={series.value}
                     onChange={(e, option) => handleSeriesValue(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item sx={{ width: '10%', minWidth: 140 }} xs={1}>
                  <AppAutocomplete
                     options={marginFilter.orderNumber}
                     label="Order Number"
                     value={orderNumberValue.value}
                     onChange={(e, option) => handleOrderNumber(option.value)}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item sx={{ width: '10%', minWidth: 100 }} xs={0.8}>
                  <AppAutocomplete
                     options={regionOptions}
                     label="Region"
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
                     Calculate Data
                  </Button>
               </Grid>

               <Grid item sx={{}}>
                  <Typography fontSize={16}>File uploaded: {uploadedFile.name}</Typography>
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

               <Grid item xs={12}>
                  <Accordion
                     expanded={openAccordionTable}
                     onChange={(e, expanded) => setOpenAccordionTable(expanded)}
                  >
                     <AccordionSummary
                        expandIcon={<GridExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                     >
                        <Typography></Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <DataTable
                           hideFooter
                           disableColumnMenu
                           tableHeight={openAccordion ? 195 : 710}
                           sx={{ margin: -2 }}
                           rowHeight={50}
                           rows={listDataAnalysis}
                           columns={columns}
                        />
                     </AccordionDetails>
                  </Accordion>
                  <Accordion
                     expanded={openAccordion}
                     onChange={(e, expanded) => setOpenAccordion(expanded)}
                  >
                     <AccordionSummary
                        expandIcon={<GridExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                     >
                        <Typography></Typography>
                     </AccordionSummary>
                     <AccordionDetails>
                        <Grid container spacing={1}>
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
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       Margin Analysis @ AOP Rate
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.marginAopRate.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Cost Uplift
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                             .costUplift
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                                  .costUplift * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                          'HYM' ||
                                       marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                          'Ruyi' ||
                                       marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                          'Staxx' ||
                                       marginAnalysisSummary?.MarginAnalystSummaryAnnually.plant ==
                                          'Maximal'
                                          ? 'Manufacturing Cost (RMB)'
                                          : marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'SN'
                                          ? 'Manufacturing Cost (USD)'
                                          : `Manufacturing Cost (${valueCurrency})`}
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalManufacturingCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Add: Warranty
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                             .addWarranty
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                                  .addWarranty * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Surcharge (inland,handling etc)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                             .surcharge
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                                  .surcharge * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Duty (AU BT Only)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryAnnually.duty
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                                  .duty * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Freight (AU Only)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.freight}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Li-lon B or C included
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                             .liIonIncluded
                                       )
                                          ? ''
                                          : marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .liIonIncluded
                                          ? 'Yes'
                                          : 'No'}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                          .fileUUID != null
                                          ? marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'HYM' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Ruyi' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Staxx' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Maximal'
                                             ? 'Total Cost (RMB)'
                                             : 'Total Cost (USD)'
                                          : `Total Cost (${valueCurrency})`}
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {`Full Cost ${valueCurrency} @AOP Rate`}
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
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
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       Margin Analysis @ Mthly I/L Rate
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.marginAopRate.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Cost Uplift
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                             .costUplift
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                                  .costUplift * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                          .fileUUID != null
                                          ? marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'HYM' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Ruyi' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Staxx' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Maximal'
                                             ? 'Manufacturing Cost (RMB)'
                                             : 'Manufacturing Cost (USD)'
                                          : `Manufacturing Cost (${valueCurrency})`}
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalManufacturingCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Add: Warranty
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                             .addWarranty
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                                  .addWarranty * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Surcharge (inland,handling etc)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                             .surcharge
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                                  .surcharge * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Duty (AU BT Only)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryMonthly.duty
                                       )
                                          ? ''
                                          : `${(
                                               marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                                  .duty * 100
                                            ).toFixed(2)}%`}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Freight (AU Only)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.freight}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Li-lon B or C included
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {_.isNil(
                                          marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                             .liIonIncluded
                                       )
                                          ? ''
                                          : marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                               .liIonIncluded
                                          ? 'Yes'
                                          : 'No'}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly
                                          .fileUUID != null
                                          ? marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'HYM' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Ruyi' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Staxx' ||
                                            marginAnalysisSummary?.MarginAnalystSummaryAnnually
                                               .plant == 'Maximal'
                                             ? 'Total Cost (RMB)'
                                             : 'Total Cost (USD)'
                                          : `Total Cost (${valueCurrency})`}
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {`Full Cost ${valueCurrency} @AOP Rate`}
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.fullMonthlyRate.toLocaleString()}
                                    </Typography>
                                 </div>
                              </Paper>
                           </Grid>
                           <Grid item xs={4}>
                              <Paper
                                 elevation={3}
                                 sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}
                              >
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       AOP 2023
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {regionValue.value}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       Target Margin % ={'>'}
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {targetMargin * 100}%
                                    </Typography>
                                 </div>
                              </Paper>
                           </Grid>
                           <Grid item xs={4}>
                              <Paper
                                 elevation={3}
                                 sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}
                              >
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {`Total List Price (${valueCurrency})`}
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalListPrice.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Blended Discount %
                                    </Typography>
                                    <Typography variant="body1" component="span">
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
                                    <Typography variant="body1" component="span">
                                       {`DN (${valueCurrency})`}
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.dealerNet.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Margin $
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.margin.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Margin % @ AOP rate
                                    </Typography>
                                    <Typography variant="body1" component="span">
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
                              <Paper
                                 elevation={3}
                                 sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}
                              >
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {`Total List Price (${valueCurrency})`}
                                    </Typography>
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalListPrice.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Blended Discount %
                                    </Typography>
                                    <Typography variant="body1" component="span">
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
                                    <Typography variant="body1" component="span">
                                       {`DN (${valueCurrency})`}
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.dealerNet.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Margin $
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.margin.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Margin % @ AOP rate
                                    </Typography>
                                    <Typography variant="body1" component="span">
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
                           <Grid item xs={4}></Grid>
                           <Grid item xs={4}>
                              <Paper
                                 elevation={3}
                                 sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}
                              >
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       For US Pricing @ AOP rate
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Manufacturing Cost (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.manufacturingCostUSD.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Warranty (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.warrantyCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Surcharge (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.surchargeCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Total Cost Excluding Freight (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalCostWithoutFreight.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Total Cost With Freight (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryAnnually.totalCostWithFreight.toLocaleString()}
                                    </Typography>
                                 </div>
                              </Paper>
                           </Grid>
                           <Grid item xs={4}>
                              <Paper
                                 elevation={3}
                                 sx={{ padding: 2, height: 'fit-content', minWidth: 300 }}
                              >
                                 <div className="space-between-element">
                                    <Typography
                                       sx={{ fontWeight: 'bold' }}
                                       variant="body1"
                                       component="span"
                                    >
                                       For US Pricing @ AOP rate
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Manufacturing Cost (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.manufacturingCostUSD.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Warranty (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.warrantyCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Surcharge (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.surchargeCost.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Total Cost Excluding Freight (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalCostWithoutFreight.toLocaleString()}
                                    </Typography>
                                 </div>
                                 <div className="space-between-element">
                                    <Typography variant="body1" component="span">
                                       Total Cost With Freight (USD)
                                    </Typography>
                                    <Typography variant="body1" component="span">
                                       {marginAnalysisSummary?.MarginAnalystSummaryMonthly.totalCostWithFreight.toLocaleString()}
                                    </Typography>
                                 </div>
                              </Paper>
                           </Grid>
                        </Grid>
                     </AccordionDetails>
                  </Accordion>
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
      maxSize: 16777216,
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
