import { AppAutocomplete, AppLayout } from '@/components';
import { Button, Grid } from '@mui/material';
import { produce } from 'immer';
import { useCallback, useEffect, useState } from 'react';
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
import reportsApi from '@/api/reports.api';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import { parseCookies } from 'nookies';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Trends() {
   const dispatch = useDispatch();
   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   useEffect(() => {
      setUserRole(userRoleCookies);
   });

   const [currencyFilter, setCurrencyFilter] = useState([]);
   const [dataFilter, setDataFilter] = useState({ currentCurrency: '', comparisonCurrencies: [] });
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
      reportsApi
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
               draft[field] = option.value;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   const handleUploadExchangeRate = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      reportsApi
         .uploadExchangeRate(formData)
         .then(() => {
            dispatch(commonStore.actions.setSuccessMessage('Upload Exchange Rate successfully'));
         })
         .catch(() => {
            dispatch(commonStore.actions.setErrorMessage('Error on uploading Exchange Rate'));
         });
   };

   const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

   const handleCompareCurrency = async () => {
      try {
         const request = {
            currentCurrency: dataFilter.currentCurrency,
            comparisonCurrencies: dataFilter.comparisonCurrencies,
         };

         reportsApi
            .compareCurrency(request)
            .then((response) => {
               const data = JSON.parse(String(response.data)).compareCurrency;

               // Setting Labels for chart
               const labels = data[dataFilter.comparisonCurrencies[0]].exchangeRateList
                  .map((item) => {
                     return `${months[item.date[1]]} ${String(item.date[0]).substring(2)}`;
                  })
                  .reverse();

               let datasets = [];
               dataFilter.comparisonCurrencies.forEach((item) => {
                  const randomColor = `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

                  datasets.push({
                     label: item,
                     data: data[item].exchangeRateList.reverse().map((obj) => obj.rate),
                     borderColor: randomColor,
                     backgroundColor: randomColor,
                     pointStyle: 'circle',
                     pointRadius: 5,
                     pointHoverRadius: 10,
                     yAxisID: item == 'JPY' ? 'y1' : 'y',
                  });
               });

               const newChartData = {
                  title: `${dataFilter.currentCurrency} to${_.map(
                     dataFilter.comparisonCurrencies,
                     (item) => ` ${item}`
                  )}`,
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
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
      }
   };

   const closeAReportItem = (index) => {
      setChartData((prev) => prev.filter((item, i) => i != index));
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
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     required
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
                  />
               </Grid>

               <CurrencyReport
                  chartData={chartData}
                  currentCurrency={dataFilter.currentCurrency}
                  closeAReportItem={closeAReportItem}
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
