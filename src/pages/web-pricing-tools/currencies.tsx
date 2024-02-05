import { AppAutocomplete, AppLayout } from '@/components';
import { Button, Grid } from '@mui/material';
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
import currencyApi from '@/api/currency.api';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import { parseCookies } from 'nookies';
import { CURRENCY } from '@/utils/constant';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Currencies() {
   const dispatch = useDispatch();
   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   useEffect(() => {
      setUserRole(userRoleCookies);
   });

   const [currencyFilter, setCurrencyFilter] = useState([]);

   const [currentCurrency, setCurrentCurrency] = useState({ value: '', error: false });
   const [comparisonCurrencies, setComparisonCurrencies] = useState({
      value: [],
      error: false,
   });
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

   useEffect(() => {
      currencyApi
         .getCurrencyFilter()
         .then((response) => {
            setCurrencyFilter(JSON.parse(String(response.data)).currencyFilter);
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   }, []);

   const handleChangeDataFilter = (option, field) => {
      if (_.includes(['currentCurrency'], field)) {
         setCurrentCurrency({ value: option.value, error: false });
      } else {
         setComparisonCurrencies((prev) =>
            produce(prev, (draft) => {
               draft.value = option.map(({ value }) => value);
               draft.error = false;
            })
         );
      }
   };

   const handleUploadExchangeRate = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      currencyApi
         .uploadExchangeRate(formData)
         .then(() => {
            dispatch(commonStore.actions.setSuccessMessage('Upload Exchange Rate successfully'));
         })
         .catch(() => {
            dispatch(commonStore.actions.setErrorMessage('Error on uploading Exchange Rate'));
         });
   };

   const handleCompareCurrency = async () => {
      try {
         if (currentCurrency.value == '') {
            setCurrentCurrency({ value: '', error: true });
            return;
         }
         if (comparisonCurrencies.value.length == 0) {
            setComparisonCurrencies({ value: [], error: true });
            return;
         }
         const request = {
            currentCurrency: currentCurrency.value,
            comparisonCurrencies: comparisonCurrencies.value,
         };

         currencyApi
            .compareCurrency(request)
            .then((response) => {
               const data = JSON.parse(String(response.data)).compareCurrency;

               // Setting Labels for chart
               const labels = data[comparisonCurrencies.value[0]].exchangeRateList
                  .map((item) => {
                     return `${months[item.date[1]]} ${String(item.date[0]).substring(2)}`;
                  })
                  .reverse();

               let datasets = [];
               comparisonCurrencies.value.forEach((item) => {
                  datasets.push({
                     label: item,
                     data: data[item].exchangeRateList.reverse().map((obj) => obj.rate),
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
                     currentCurrency.value == 'CNY' ? 'RMB' : currentCurrency.value
                  } to${_.map(comparisonCurrencies.value, (item) => ` ${item}`)}`,
                  data: {
                     labels: labels,
                     datasets: datasets,
                  },
                  conclusion: {
                     stable: data.stable,
                     weakening: data.weakening,
                     strengthening: data.strengthening,
                  },
               };
               setChartData((prev) => [...prev, newChartData]);
            })
            .catch((error) => {
               dispatch(commonStore.actions.setErrorMessage(error.message));
            });
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

   return (
      <>
         <AppLayout entity="reports">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 70, marginLeft: 1 }}>
                  <AppAutocomplete
                     options={currencyFilter}
                     label="Current Currency"
                     onChange={(e, option) => handleChangeDataFilter(option, 'currentCurrency')}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     required
                     error={currentCurrency.error}
                     helperText="This field is required"
                  />
                  <Grid sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                     <Button
                        variant="contained"
                        sx={{ width: '45%', height: 24 }}
                        onClick={handleCompareCurrency}
                     >
                        Compare
                     </Button>

                     {userRole === 'ADMIN' && (
                        <Grid item sx={{ width: '45%', minWidth: 90 }}>
                           <UploadFileDropZone
                              uploadedFile={uploadedFile}
                              setUploadedFile={setUploadedFile}
                              handleUploadFile={handleUploadExchangeRate}
                              buttonName="Upload File"
                              sx={{ width: '100%', height: 24 }}
                           />
                        </Grid>
                     )}
                  </Grid>
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={currencyFilter}
                     label="Comparison Currencies"
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
                     error={comparisonCurrencies.error}
                     helperText="This field requires at least one item"
                  />
               </Grid>

               <CurrencyReport
                  chartData={chartData}
                  currentCurrency={currentCurrency.value == 'CNY' ? 'RMB' : currentCurrency.value}
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
