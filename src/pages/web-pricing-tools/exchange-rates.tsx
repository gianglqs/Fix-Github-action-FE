import { AppAutocomplete, AppDateField, AppLayout } from '@/components';
import { Button, Grid, RadioGroup, FormControlLabel, Radio, CircularProgress } from '@mui/material';
import { produce } from 'immer';
import { useCallback, useEffect, useRef, useState } from 'react';
import _ from 'lodash';

import {
   Chart as ChartJS,
   LinearScale,
   PointElement,
   Tooltip,
   LineElement,
   Legend,
   CategoryScale,
   Title,
} from 'chart.js';
import ChartAnnotation from 'chartjs-plugin-annotation';

ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Tooltip,
   Legend,
   Title,
   ChartAnnotation
);

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { CurrencyReport } from '@/components/CurrencyReport';
import exchangeRatesApi from '@/api/exchangeRates.api';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import { parseCookies } from 'nookies';
import { CURRENCY } from '@/utils/constant';
import { useTranslation } from 'react-i18next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function ExchangeRate() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   const [loading, setLoading] = useState(false);
   const [dataFilter, setDataFilter] = useState({
      fromDate: { value: '' },
      toDate: { value: '' },
      currentCurrency: { value: '', error: false },
      comparisonCurrencies: {
         value: [],
         error: false,
      },
   });

   useEffect(() => {
      setUserRole(userRoleCookies);
   });

   const [currencyFilter, setCurrencyFilter] = useState([{ value: '' }]);

   const months = [
      '',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
   ];

   const [chartData, setChartData] = useState([]);
   const [uploadedFile, setUploadedFile] = useState();
   const [exchangeRateSource, setExchangeRateSource] = useState('Database');

   useEffect(() => {
      exchangeRatesApi
         .getCurrencyFilter()
         .then((response) => {
            setCurrencyFilter(JSON.parse(String(response.data)).currencyFilter);
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   }, []);

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['currentCurrency'], field)) {
               draft[field] = { value: option.value, error: false };
            } else if (_.includes(['fromDate', 'toDate'], field)) {
               exchangeRateSource === 'Database'
                  ? (draft[field].value = option.slice(0, -3))
                  : (draft[field].value = option.slice(0));
            } else {
               draft[field].value = option.map(({ value }) => value);
               draft[field].error = false;
            }
         })
      );
   };

   const handleUploadExchangeRate = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      exchangeRatesApi
         .uploadExchangeRate(formData)
         .then(() => {
            dispatch(commonStore.actions.setSuccessMessage('Upload Exchange Rate successfully'));
         })
         .catch((error) => {
            console.log(error);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleCompareCurrency = async () => {
      try {
         if (dataFilter.currentCurrency.value == '') {
            dispatch(commonStore.actions.setErrorMessage('User must select currency unit'));
            setDataFilter((prev) =>
               produce(prev, (draft) => {
                  draft['currentCurrency'] = { value: '', error: true };
               })
            );
            return;
         }
         if (dataFilter.comparisonCurrencies.value.length == 0) {
            dispatch(commonStore.actions.setErrorMessage('User must select comparison currencies'));
            setDataFilter((prev) =>
               produce(prev, (draft) => {
                  draft['comparisonCurrencies'] = { value: [], error: true };
               })
            );
            return;
         }
         const request = {
            currentCurrency: dataFilter.currentCurrency.value,
            comparisonCurrencies: dataFilter.comparisonCurrencies.value,
            fromDate: dataFilter.fromDate.value,
            toDate: dataFilter.toDate.value,
            fromRealTime: exchangeRateSource == 'Database' ? false : true,
         };
         setLoading(true);
         exchangeRatesApi
            .compareCurrency(request)
            .then((response) => {
               const data = response.data.compareCurrency;

               // Setting Labels for chart
               const labels = data[dataFilter.comparisonCurrencies.value[0]]
                  .map((item) => {
                     if (exchangeRateSource === 'Database') {
                        return `${months[item.date[1]]} ${String(item.date[0]).substring(2)}`;
                     } else {
                        return `${item.date[2]} ${months[item.date[1]]} ${String(
                           item.date[0]
                        ).substring(2)}`;
                     }
                  })
                  .reverse();

               let datasets = [];
               dataFilter.comparisonCurrencies.value.forEach((item) => {
                  datasets.push({
                     label: item,
                     data: data[item].reverse().map((obj) => obj.rate),
                     borderColor: CURRENCY[item],
                     backgroundColor: CURRENCY[item],
                     pointStyle: 'circle',
                     pointRadius: 5,
                     pointHoverRadius: 10,
                     yAxisID: item == 'JPY' ? 'y1' : 'y',
                  });
               });

               const newChartData = {
                  title: `${
                     dataFilter.currentCurrency.value == 'CNY'
                        ? 'RMB'
                        : dataFilter.currentCurrency.value
                  } to${_.map(dataFilter.comparisonCurrencies.value, (item) => ` ${item}`)}`,
                  data: {
                     labels: labels,
                     datasets: datasets,
                  },
                  conclusion: {
                     stable: data.stable,
                     weakening: data.weakening,
                     strengthening: data.strengthening,
                  },
                  lastUpdated: data.lastUpdated,
               };
               setChartData((prev) => [...prev, newChartData]);
            })
            .catch((error) => {
               dispatch(commonStore.actions.setErrorMessage(error.message));
            })
            .finally(() => setLoading(false));
         isCompareClicked.current = !isCompareClicked.current;
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
      }
   };

   const isCompareClicked = useRef(true);

   useEffect(() => {
      scrollToLast();
   }, [isCompareClicked.current]);

   const closeAReportItem = (index) => {
      setChartData((prev) => prev.filter((item, i) => i != index));
   };

   const ref = useRef(null);

   const scrollToLast = () => {
      const lastChildElement = ref?.current?.lastElementChild;
      lastChildElement?.scrollIntoView({ behavior: 'smooth' });
   };

   const handleChangeRadioButton = (event) => {
      setExchangeRateSource(event.target.value);
      handleChangeDataFilter('', 'fromDate');
      handleChangeDataFilter('', 'toDate');
   };

   const handleClearAllFilters = () => {
      setExchangeRateSource('Database');
      setDataFilter({
         fromDate: { value: '' },
         toDate: { value: '' },
         currentCurrency: { value: '', error: false },
         comparisonCurrencies: {
            value: [],
            error: false,
         },
      });
   };

   const handleClearAllReports = () => {
      setChartData([]);
   };

   const currentYear = new Date().getFullYear();
   const currentMonth = new Date().getMonth() + 1;
   // const currentDay = new Date().getDay;

   return (
      <>
         <AppLayout entity="reports">
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
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 70, marginLeft: 1, marginTop: 1 }}>
                  <AppAutocomplete
                     options={currencyFilter}
                     onChange={(e, option) => handleChangeDataFilter(option, 'currentCurrency')}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     required
                     error={dataFilter.currentCurrency.error}
                     helperText="This field is required"
                     value={dataFilter.currentCurrency.value}
                  />
                  <Grid sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                     <Button
                        variant="contained"
                        sx={{ width: '45%', height: 24 }}
                        onClick={handleCompareCurrency}
                     >
                        {t('button.compare')}
                     </Button>

                     {userRole === 'ADMIN' && (
                        <Grid item sx={{ width: '45%', minWidth: 90 }}>
                           <UploadFileDropZone
                              uploadedFile={uploadedFile}
                              setUploadedFile={setUploadedFile}
                              handleUploadFile={handleUploadExchangeRate}
                              buttonName={t('button.uploadFile')}
                              sx={{ width: '100%', height: 24 }}
                           />
                        </Grid>
                     )}
                  </Grid>
               </Grid>
               <Grid
                  item
                  sx={{
                     zIndex: 10,
                     height: 25,
                     fontSize: 15,
                     marginTop: 1,
                  }}
               >
                  To
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25, marginTop: 1 }}>
                  <AppAutocomplete
                     options={currencyFilter}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) =>
                        handleChangeDataFilter(option, 'comparisonCurrencies')
                     }
                     limitTags={3}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     required
                     error={dataFilter.comparisonCurrencies.error}
                     helperText="This field requires at least one item"
                     value={dataFilter.comparisonCurrencies.value.map((value) => {
                        return { value };
                     })}
                  />
                  <Grid sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                     <Button
                        variant="contained"
                        sx={{ width: '45%', height: 24, minWidth: 100 }}
                        onClick={handleClearAllFilters}
                     >
                        {t('button.clear')}
                     </Button>

                     <Button
                        variant="contained"
                        sx={{ width: '55%', marginLeft: 1, height: 24, minWidth: 100 }}
                        onClick={handleClearAllReports}
                     >
                        {t('button.clearReports')}
                     </Button>
                  </Grid>
               </Grid>

               <Grid item xs={2.5} sx={{ height: 50 }}>
                  <RadioGroup
                     row
                     value={exchangeRateSource}
                     onChange={handleChangeRadioButton}
                     aria-labelledby="demo-row-radio-buttons-group-label"
                     name="row-radio-buttons-group"
                     sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginLeft: 1,
                        marginTop: 0.25,
                     }}
                  >
                     <FormControlLabel
                        value="Database"
                        control={<Radio />}
                        label={t('button.HYGexchangeRate')}
                     />
                     <FormControlLabel
                        value="Real-time"
                        control={<Radio />}
                        label={t('button.fromExchangeRateApi')}
                     />
                  </RadioGroup>
               </Grid>

               <Grid item xs={1}>
                  <AppDateField
                     views={
                        exchangeRateSource === 'Database'
                           ? ['month', 'year']
                           : ['day', 'month', 'year']
                     }
                     label={t('filters.fromDate')}
                     name="fromDate"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'fromDate')
                     }
                     value={dataFilter.fromDate.value}
                     maxDate={new Date().toISOString().slice(0, 10)}
                     sx={{ marginTop: 1 }}
                  />
               </Grid>
               <Grid item xs={1}>
                  <AppDateField
                     views={
                        exchangeRateSource === 'Database'
                           ? ['month', 'year']
                           : ['day', 'month', 'year']
                     }
                     label={t('filters.toDate')}
                     name="toDate"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'toDate')
                     }
                     value={dataFilter.toDate.value}
                     maxDate={new Date().toISOString().slice(0, 10)}
                     sx={{ marginTop: 1 }}
                  />
               </Grid>

               <CurrencyReport
                  chartData={chartData}
                  closeAReportItem={closeAReportItem}
                  scrollToLast={scrollToLast}
                  itemRef={ref}
               />
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
