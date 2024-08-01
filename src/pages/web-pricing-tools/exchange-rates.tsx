import { AppAutocomplete, AppDateField, AppLayout } from '@/components';
import { hexToRGBA } from '@/utils/mapping';
import { Box, Button, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material';
import {
   CategoryScale,
   Chart as ChartJS,
   Legend,
   LinearScale,
   LineElement,
   PointElement,
   Title,
   Tooltip,
} from 'chart.js';
import ChartAnnotation from 'chartjs-plugin-annotation';
import { produce } from 'immer';
import _ from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
//store
import { exchangeRateStore } from '@/store/reducers';
//others
import { defaultValueSelectedFilterExchangeRate } from '@/utils/defaultValues';
const crossHairPlugin = {
   id: 'crossHairPlugin',
   afterDraw: (chart) => {
      if (chart.tooltip?._active?.length) {
         let x = chart.tooltip._active[0].element.x;
         let yAxis = chart.scales.y;
         let ctx = chart.ctx;
         ctx.save();
         ctx.beginPath();
         ctx.setLineDash([3, 3]);
         ctx.moveTo(x, yAxis.top);
         ctx.lineTo(x, yAxis.bottom);
         ctx.lineWidth = 1;
         ctx.strokeStyle = '#333';
         ctx.stroke();
         ctx.restore();
      }
   },
};
ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Tooltip,
   Legend,
   Title,
   ChartAnnotation,
   crossHairPlugin
);

import exchangeRatesApi from '@/api/exchangeRates.api';
import AppBackDrop from '@/components/App/BackDrop';
import { UploadFileDropZone } from '@/components/App/UploadFileDropZone';
import { CurrencyReport } from '@/components/CurrencyReport';
import { commonStore } from '@/store/reducers';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { CURRENCY } from '@/utils/constant';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { EXCHANGE_RATE } from '@/utils/modelType';
import GetAppIcon from '@mui/icons-material/GetApp';
import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function ExchangeRate() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   const dataFilter = useSelector(exchangeRateStore.selectDataFilter);
   const loadingPage = useSelector(exchangeRateStore.selectLoadingPage);
   useEffect(() => {
      setUserRole(userRoleCookies);
   });

   const currencyFilter = useSelector(exchangeRateStore.selectCurrencyFilter);
   const exchangeRateSource = useSelector(exchangeRateStore.selectExchangeRateSource);
   const chartData = useSelector(exchangeRateStore.selectChartData);

   //const [currencyFilter, setCurrencyFilter] = useState([{ value: '' }]);

   const months = useMemo(
      () => [
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
      ],
      []
   );

   const [exampleUploadFile, setExampleUploadFile] = useState(null);

   useEffect(() => {
      exchangeRatesApi
         .getCurrencyFilter()
         .then((response) => {
            // Set 'CNY' to 'RMB'
            var listCurrency = JSON.parse(String(response.data)).currencyFilter;
            listCurrency.forEach((currency) => {
               currency.value = currency.value === 'CNY' ? 'RMB' : currency.value;
            });
            listCurrency.sort((a, b) => a.value > b.value);
            dispatch(exchangeRateStore.actions.setCurrencyFilter(listCurrency));
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });

      exchangeRatesApi.getExampleUploadFile().then((res) => {
         setExampleUploadFile(JSON.parse(String(res.data)).exampleUploadFile);
      });
   }, []);

   const handleChangeDataFilter = (option, field) => {
      dispatch(
         exchangeRateStore.actions.setDataFilter(
            produce(dataFilter, (draft) => {
               if (_.includes(['currentCurrency'], field)) {
                  draft[field] = { value: option.value, error: false };
               } else if (_.includes(['fromDate', 'toDate'], field)) {
                  draft[field].value = option.slice(0, -3);
               } else {
                  draft[field].value = option.map(({ value }) => value);
                  draft[field].error = false;
               }
            })
         )
      );
   };

   const handleCompareCurrency = async () => {
      try {
         if (dataFilter.currentCurrency.value == '') {
            dispatch(commonStore.actions.setErrorMessage('Please select the currency to exchange'));
            dispatch(
               exchangeRateStore.actions.setDataFilter(
                  produce(dataFilter, (draft) => {
                     draft['currentCurrency'] = { value: '', error: true };
                  })
               )
            );
            return;
         }
         if (dataFilter.comparisonCurrencies.value.length == 0) {
            dispatch(
               commonStore.actions.setErrorMessage('Please select the currencies to exchange to')
            );
            dispatch(
               exchangeRateStore.actions.setDataFilter(
                  produce(dataFilter, (draft) => {
                     draft['comparisonCurrencies'] = { value: [], error: true };
                  })
               )
            );
            return;
         } else {
            // Copy object, not reference
            var listComparisionCurrency = { ...dataFilter.comparisonCurrencies };
            listComparisionCurrency.value = listComparisionCurrency.value.map((currency) => {
               return currency == 'RMB' ? 'CNY' : currency;
            });
         }
         const request = {
            currentCurrency:
               dataFilter.currentCurrency.value === 'RMB'
                  ? 'CNY'
                  : dataFilter.currentCurrency.value,
            comparisonCurrencies: listComparisionCurrency.value,
            fromDate: dataFilter.fromDate.value,
            toDate: dataFilter.toDate.value,
            fromExchangeRateAPIs: exchangeRateSource == 'Database' ? false : true,
         };
         dispatch(exchangeRateStore.actions.showLoadingPage());

         const fd = new Date(request.fromDate);
         const td = new Date(request.toDate);

         const monthDiff: number =
            (td.getFullYear() - fd.getFullYear()) * 12 + (td.getMonth() - fd.getMonth());

         const timeDiff: number = td.getTime() - fd.getTime();
         const dayDiff: number = timeDiff / (1000 * 3600 * 24) + 1;

         if (request.fromDate != '' && request.toDate != '') {
            if (request.fromExchangeRateAPIs == false) {
               if (monthDiff < 12) {
                  exchangeRatesApi
                     .compareCurrency(request)
                     .then((response) => {
                        const data = response.data.compareCurrency;
                        // Setting Labels for chart
                        const labels = data[
                           dataFilter.comparisonCurrencies.value[0] == 'RMB'
                              ? 'CNY'
                              : dataFilter.comparisonCurrencies.value[0]
                        ]
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
                           // Change RMB to CNY to handle
                           item = item == 'RMB' ? 'CNY' : item;
                           datasets.push({
                              label: item === 'CNY' ? 'RMB' : item,
                              data: data[item].reverse().map((obj) => obj.rate),
                              borderColor: CURRENCY[item],
                              backgroundColor: CURRENCY[item],
                              pointStyle: 'circle',
                              pointRadius: 0,
                              lineTension: 0.05,
                              borderWidth: 1.5,
                              pointHoverRadius: 2,
                              hoverBorderWidth: 12,
                              hoverBorderColor: hexToRGBA(CURRENCY[item], 0.3),
                              yAxisID: item == 'JPY' ? 'y1' : 'y',
                           });
                        });

                        const newChartData = {
                           title: `${
                              dataFilter.currentCurrency.value
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

                        // Reverse change CNY to RMB to display chart
                        var tmpChart = { ...newChartData };
                        tmpChart.conclusion.stable = tmpChart.conclusion.stable.map((item) => {
                           return item == 'CNY' ? 'RMB' : item;
                        });
                        dispatch(exchangeRateStore.actions.setChartData([...chartData, tmpChart]));
                     })
                     .catch((error) => {
                        dispatch(commonStore.actions.setErrorMessage(error.message));
                     })
                     .finally(() => dispatch(exchangeRateStore.actions.hideLoadingPage()));
                  isCompareClicked.current = !isCompareClicked.current;
               } else {
                  dispatch(exchangeRateStore.actions.hideLoadingPage());
                  dispatch(
                     commonStore.actions.setErrorMessage(
                        t('commonErrorMessage.timeExceedsTwelveMonths')
                     )
                  );
               }
            } else {
               if (monthDiff < 13) {
                  exchangeRatesApi
                     .compareCurrency(request)
                     .then((response) => {
                        const data = response.data.compareCurrency;

                        // Setting Labels for chart
                        const labels = data[
                           dataFilter.comparisonCurrencies.value[0] == 'RMB'
                              ? 'CNY'
                              : dataFilter.comparisonCurrencies.value[0]
                        ]
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
                           // Change RMB to CNY to handle
                           item = item == 'RMB' ? 'CNY' : item;
                           datasets.push({
                              label: item === 'CNY' ? 'RMB' : item,
                              data: data[item].reverse().map((obj) => obj.rate),
                              borderColor: CURRENCY[item],
                              backgroundColor: CURRENCY[item],
                              pointStyle: 'circle',
                              pointRadius: 0,
                              lineTension: 0.05,
                              borderWidth: 1.5,
                              pointHoverRadius: 2,
                              hoverBorderWidth: 12,
                              hoverBorderColor: hexToRGBA(CURRENCY[item], 0.3),
                              yAxisID: item == 'JPY' ? 'y1' : 'y',
                           });
                        });

                        const newChartData = {
                           title: `${
                              dataFilter.currentCurrency.value
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

                        // Reverse change CNY to RMB to display chart
                        var tmpChart = { ...newChartData };
                        tmpChart.conclusion.stable = tmpChart.conclusion.stable.map((item) => {
                           return item == 'CNY' ? 'RMB' : item;
                        });
                        dispatch(exchangeRateStore.actions.setChartData([...chartData, tmpChart]));
                     })
                     .catch((error) => {
                        dispatch(commonStore.actions.setErrorMessage(error.message));
                     })
                     .finally(() => dispatch(exchangeRateStore.actions.hideLoadingPage()));
                  isCompareClicked.current = !isCompareClicked.current;
               } else {
                  dispatch(exchangeRateStore.actions.hideLoadingPage());
                  dispatch(
                     commonStore.actions.setErrorMessage(
                        t('commonErrorMessage.timeExceedsTwelveMonths')
                     )
                  );
               }
            }
         } else {
            exchangeRatesApi
               .compareCurrency(request)
               .then((response) => {
                  const data = response.data.compareCurrency;

                  // Setting Labels for chart
                  const labels = data[
                     dataFilter.comparisonCurrencies.value[0] == 'RMB'
                        ? 'CNY'
                        : dataFilter.comparisonCurrencies.value[0]
                  ]
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
                     // Change RMB to CNY to handle
                     item = item == 'RMB' ? 'CNY' : item;
                     datasets.push({
                        label: item === 'CNY' ? 'RMB' : item,
                        data: data[item].reverse().map((obj) => obj.rate),
                        borderColor: CURRENCY[item],
                        backgroundColor: CURRENCY[item],
                        pointStyle: 'circle',
                        pointRadius: 0,
                        lineTension: 0.05,
                        borderWidth: 1.5,
                        pointHoverRadius: 2,
                        hoverBorderWidth: 12,
                        hoverBorderColor: hexToRGBA(CURRENCY[item], 0.3),
                        yAxisID: item == 'JPY' ? 'y1' : 'y',
                     });
                  });

                  const newChartData = {
                     title: `${
                        dataFilter.currentCurrency.value
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

                  // Reverse change CNY to RMB to display chart
                  var tmpChart = { ...newChartData };
                  tmpChart.conclusion.stable = tmpChart.conclusion.stable.map((item) => {
                     return item == 'CNY' ? 'RMB' : item;
                  });
                  dispatch(exchangeRateStore.actions.setChartData([...chartData, tmpChart]));
               })
               .catch((error) => {
                  dispatch(commonStore.actions.setErrorMessage(error.message));
               })
               .finally(() => dispatch(exchangeRateStore.actions.hideLoadingPage()));
            isCompareClicked.current = !isCompareClicked.current;
         }
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage());
      }
   };

   const isCompareClicked = useRef(true);

   useEffect(() => {
      scrollToLast();
   }, [isCompareClicked.current]);

   const closeAReportItem = (index) => {
      const chartDataWithoutIndex = chartData.filter((item, i) => i != index);
      dispatch(exchangeRateStore.actions.setChartData(chartDataWithoutIndex));
   };

   const ref = useRef(null);

   const scrollToLast = () => {
      const lastChildElement = ref?.current?.lastElementChild;
      lastChildElement?.scrollIntoView({ behavior: 'smooth' });
   };

   const handleChangeRadioButton = (event) => {
      dispatch(exchangeRateStore.actions.setExchangeRateSource(event.target.value));
   };

   const handleClearAllFilters = () => {
      //  setExchangeRateSource('Database');
      dispatch(exchangeRateStore.actions.setExchangeRateSource('Database'));
      dispatch(exchangeRateStore.actions.setDataFilter(defaultValueSelectedFilterExchangeRate));
   };

   const handleClearAllReports = () => {
      dispatch(exchangeRateStore.actions.setChartData([]));
   };

   const handleUploadExchangeRateFile = async (file: File) => {
      dispatch(exchangeRateStore.uploadExchangeRateFile(file));
   };

   return (
      <>
         <AppLayout entity="reports">
            <AppBackDrop open={loadingPage} hightHeaderTable={60} bottom={1} />
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
                              handleUploadFile={handleUploadExchangeRateFile}
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
               <Grid
                  item
                  xs={2}
                  sx={{ zIndex: 10, position: 'relative', height: 25, marginTop: 1 }}
               >
                  <AppAutocomplete
                     options={currencyFilter}
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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

               <Grid item xs={2}>
                  <Box sx={{ display: 'flex', gap: '5px' }}>
                     <AppDateField
                        views={['month', 'year']}
                        label={t('filters.fromDate')}
                        name="fromDate"
                        onChange={(e, value) =>
                           handleChangeDataFilter(_.isNil(value) ? '' : value, 'fromDate')
                        }
                        value={dataFilter.fromDate.value}
                        maxDate={new Date().toISOString().slice(0, 10)}
                        sx={{ marginTop: 1 }}
                     />

                     <AppDateField
                        views={['month', 'year']}
                        label={t('filters.toDate')}
                        name="toDate"
                        onChange={(e, value) =>
                           handleChangeDataFilter(_.isNil(value) ? '' : value, 'toDate')
                        }
                        value={dataFilter.toDate.value}
                        maxDate={new Date().toISOString().slice(0, 10)}
                        sx={{ marginTop: 1 }}
                     />
                     {userRole === 'ADMIN' && (
                        <Typography
                           sx={{
                              color: 'blue',
                              fontSize: 5,
                              margin: '0 30px 0 10px',
                              cursor: 'pointer',
                              marginTop: '10px',
                           }}
                           onClick={() => downloadFileByURL(exampleUploadFile[EXCHANGE_RATE])}
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
                     )}
                  </Box>
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
