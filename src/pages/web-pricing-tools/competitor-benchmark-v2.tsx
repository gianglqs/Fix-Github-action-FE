import { useCallback } from 'react';
import { Button, CircularProgress, Hidden, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
   AppLayout,
   AppAutocomplete,
   AppTextField,
   AppDateField,
   DataTablePagination,
} from '@/components';
import Paper from '@mui/material/Paper';
import { paperStyle } from '@/theme/paperStyle';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatDate, formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import Grid from '@mui/material/Grid';
import indicatorApi from '@/api/indicators.api';
import AppDataTable from '@/components/DataTable/AppDataGridPro';
import { produce } from 'immer';
import { defaultValueFilterIndicator } from '@/utils/defaultValues';
import {
   Chart as ChartJS,
   LinearScale,
   PointElement,
   Tooltip,
   LineElement,
   CategoryScale,
   Title,
   Legend,
} from 'chart.js';
import Box from '@mui/material';
import Slider from '@mui/material/Slider';
import ChartAnnotation from 'chartjs-plugin-annotation';
import _ from 'lodash';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { useEffect, useState } from 'react';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { useDropzone } from 'react-dropzone';
import { indicatorStore, commonStore } from '@/store/reducers';
import { indicatorV2Store } from '@/store/reducers';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import AppBackDrop from '@/components/App/BackDrop';
import { useTranslation } from 'react-i18next';
import { log } from 'console';
import { Bubble } from 'react-chartjs-2';
import { BorderStyle, Dataset } from '@mui/icons-material';
//hooks
import { useLayoutEffect } from 'react';
import { ref } from 'yup';
const getOrCreateLegendList = (chart, id) => {
   const legendContainer = document.getElementById(id);
   let listContainer = legendContainer.querySelector('ul');

   if (!listContainer) {
      listContainer = document.createElement('ul');
      listContainer.style.display = 'flex';
      listContainer.style.flexDirection = 'column';
      listContainer.style.overflowY = 'scroll';
      listContainer.style.margin = '0';
      listContainer.style.width = '150px';
      listContainer.style.padding = '0';
      listContainer.style.height = '500px';
      listContainer.style.gap = '5px';
      legendContainer.appendChild(listContainer);
   }

   return listContainer;
};

const htmlLegendPlugin = {
   id: 'htmlLegend',
   afterUpdate(chart, args, options) {
      const ul = getOrCreateLegendList(chart, options.containerID);

      // Remove old legend items
      while (ul.firstChild) {
         ul.firstChild.remove();
      }

      // Reuse the built-in legendItems generator
      const items = chart.options.plugins.legend.labels.generateLabels(chart);

      items.forEach((item) => {
         const li = document.createElement('li');
         li.style.alignItems = 'center';
         li.style.cursor = 'pointer';
         li.style.display = 'flex';
         li.style.flexDirection = 'col';
         li.style.marginLeft = '10px';

         li.onclick = () => {
            const { type } = chart.config;
            if (type === 'pie' || type === 'doughnut') {
               // Pie and doughnut charts only have a single dataset and visibility is per item
               chart.toggleDataVisibility(item.index);
            } else {
               chart.setDatasetVisibility(
                  item.datasetIndex,
                  !chart.isDatasetVisible(item.datasetIndex)
               );
            }
            chart.update();
         };

         // Color box
         const boxSpan = document.createElement('span');
         boxSpan.style.background = item.fillStyle;
         boxSpan.style.borderColor = item.strokeStyle;
         boxSpan.style.borderWidth = item.lineWidth + 'px';
         boxSpan.style.display = 'inline-block';
         boxSpan.style.flexShrink = '0';
         boxSpan.style.height = '20px';
         boxSpan.style.marginRight = '10px';
         boxSpan.style.width = '20px';
         boxSpan.style.borderRadius = '100%';

         // Text
         const textContainer = document.createElement('p');
         textContainer.style.color = item.fontColor;
         textContainer.style.margin = '0';
         textContainer.style.padding = '0';
         textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

         const text = document.createTextNode(item.text);
         textContainer.appendChild(text);

         li.appendChild(boxSpan);
         li.appendChild(textContainer);
         ul.appendChild(li);
      });
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
   htmlLegendPlugin
);

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

const defaultDataFilterBubbleChart = {
   regions: '',
   countries: [],
   classes: [],
   categories: [],
   series: [],
};

export default function IndicatorsV2() {
   const { t } = useTranslation();
   const dispatch = useDispatch();
   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   useEffect(() => {
      setUserRole(userRoleCookies);
   });
   const [legend, setLegend] = useState();
   const [loading, setLoading] = useState(false);

   const [loadingTable, setLoadingTable] = useState(false);
   const [loadingSwot, setLoadingSwot] = useState(false);

   const tableState = useSelector(commonStore.selectTableState);

   // select data Filter in store
   const initDataFilter = useSelector(indicatorStore.selectInitDataFilter);

   const cacheDataFilter = useSelector(indicatorStore.selectDataFilter);

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const listTotalRow = useSelector(indicatorStore.selectTotalRow);

   const getDataForTable = useSelector(indicatorStore.selectIndicatorList);
   const serverTimeZone = useSelector(indicatorStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(indicatorStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(indicatorStore.selectLastUpdatedBy);
   // v2
   const selectedFilter = useSelector(indicatorV2Store.selectChartSelectedFilters);
   const optionsFilter = useSelector(indicatorV2Store.selectChartFilterOptions);
   const { dataset, trendline, modeline, maxX, maxY } = useSelector(
      indicatorV2Store.selectChartData
   );

   const [competitiveLandscapeData, setCompetitiveLandscapeData] = useState({
      datasets: [],
      clearFilter: false,
   });
   const cachDataFilterBubbleChart = useSelector(indicatorStore.selectDataFilterBubbleChart);
   const [swotDataFilter, setSwotDataFilter] = useState(cachDataFilterBubbleChart);

   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);
   const [hasSetSwotFilter, setHasSetSwotFilter] = useState(false);

   //setting chart Data
   const [sliderLeadTime, setSliderLeadTime] = useState([0, 0]);
   const [sliderPrice, setSliderPrice] = useState([0, 0]);

   useEffect(() => {
      dispatch(indicatorV2Store.sagaGetList());
   }, []);
   useEffect(() => {
      setSliderLeadTime([0, maxX]);
      setSliderPrice([0, maxY]);
   }, [maxX, maxY]);

   useEffect(() => {
      if (!hasSetDataFilter && cacheDataFilter) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   }, [cacheDataFilter]);

   const [regionError, setRegionError] = useState({ error: false });

   useEffect(() => {
      if (!hasSetSwotFilter && cacheDataFilter) {
         setSwotDataFilter(cachDataFilterBubbleChart);
         setHasSetSwotFilter(true);
      }
   }, [cachDataFilterBubbleChart]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(swotDataFilter)) {
            setCookie(null, 'indicatorBubbleChartFilter', JSON.stringify(swotDataFilter), {
               maxAge: 604800,
               path: '/',
            });
            //  handleFilterCompetitiveLandscape();
         }
      }, 700);
      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [swotDataFilter]);

   useEffect(() => {
      setLoadingTable(false);
   }, [getDataForTable]);

   useEffect(() => {
      setLoadingSwot(false);
   }, [competitiveLandscapeData]);

   const [bubbleCountryInitFilter, setBubbleCountryInitFilter] = useState(initDataFilter.countries);

   const [bubbleClassInitFilter, setBubbleClassInitFilter] = useState(initDataFilter.classes);

   const [bubbleCategoryInitFilter, setBubbleCategoryInitFilter] = useState(
      initDataFilter.categories
   );

   const [bubbleSerieInitFilter, setBubbleSerieInitFilter] = useState(initDataFilter.series);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            setCookie(null, 'indicatorTableFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterIndicator();
         }
      }, 500);
      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   useEffect(() => {
      if (swotDataFilter.regions != null) setRegionError({ error: false });
   }, [swotDataFilter]);

   const handleChangeDataFilter = (option, field) => {
      console.log('option la: ', option);

      const newSelectedFilter =
         field == 'regions'
            ? { ...selectedFilter, [field]: option.value }
            : { ...selectedFilter, [field]: option?.map(({ value }) => value) };
      dispatch(indicatorV2Store.actions.setChartSelectedFilters(newSelectedFilter));
      dispatch(indicatorV2Store.sagaGetList());

      /*setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['leadTime', 'marginPercentage'], field)) {
               draft[field] = option.value;
            } else {
               draft[field] = option.map(({ value }) => value);
               console.log('aaaaaaaaaaaaa');
            }
         })
      );*/
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(indicatorV2Store.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const handleFilterIndicator = () => {
      setLoadingTable(true);
      dispatch(indicatorStore.actions.setDefaultValueFilterIndicator(dataFilter));
      handleChangePage(1);
   };

   const handleImportFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setLoading(true);

      indicatorApi
         .importIndicatorFile(formData)
         .then(() => {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage('Import succesfully'));

            handleFilterIndicator();
            //  handleFilterCompetitiveLandscape();
         })
         .catch((error) => {
            setLoading(false);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleUploadForecastFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setLoading(true);
      indicatorApi
         .importForecastFile(formData)
         .then(() => {
            setLoading(false);
            dispatch(commonStore.actions.setSuccessMessage('Upload successfully'));
            handleFilterIndicator();
         })
         .catch((error) => {
            setLoading(false);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const currentYear = new Date().getFullYear();

   const columns = [
      {
         field: 'region',
         flex: 0.7,
         minWidth: 60,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.country.region.regionName}</span>;
         },
      },
      {
         field: 'country',
         flex: 0.6,
         minWidth: 60,
         headerName: t('table.country'),
         renderCell(params) {
            return <span>{params.row.country?.countryName}</span>;
         },
      },
      {
         field: 'clazz',
         flex: 1,
         minWidth: 60,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.6,
         minWidth: 60,
         headerName: t('table.series'),
      },
      {
         field: 'group',
         flex: 0.6,
         minWidth: 60,
         headerName: t('table.group'),
         renderCell(params) {
            return <span>{params.row.color?.groupName}</span>;
         },
      },

      {
         field: 'HYGAverageStreetPrice',
         flex: 0.8,
         minWidth: 140,
         headerName: t('table.HYGAverageStreetPrice'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerStreetPricing)}</span>;
         },
      },
      {
         field: 'priceForPlayer',
         flex: 0.8,
         minWidth: 130,
         headerName: `${t('table.priceForPlayer')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerHandlingCost)}</span>;
         },
      },
      {
         field: 'playerHYGVariance',
         flex: 1,
         minWidth: 100,
         headerName: `${t('table.playerHYGVariance')} `,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.variancePercentage * 100)}</span>;
         },
      },
   ];

   const handleClearAllFilterTable = () => {
      setDataFilter(defaultValueFilterIndicator);
   };

   const handleClearAllFilterBubbleChart = () => {
      setSwotDataFilter(defaultDataFilterBubbleChart);
      setCompetitiveLandscapeData({
         datasets: [],
         clearFilter: true,
      });
   };

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   useEffect(() => {
      convertTimezone();
   }, [serverTimeZone, serverLastUpdatedTime]);

   // show latest updated time
   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   const handleOnSliderChange = (option, value) => {
      setSliderLeadTime(value);
   };
   const options = {
      scales: {
         y: {
            beginAtZero: true,
            min: sliderPrice[0],
            max: sliderPrice[1],
            title: {
               text: 'Price $',
               display: true,
            },
            ticks: {
               maxTicksLimit: 10,
               callback: function (value, index, values) {
                  return value == 0 ? 0 : `$${(value / 1000).toFixed(0)}K`;
               },
            },
         },
         x: {
            beginAtZero: true,
            min: sliderLeadTime[0],
            max: sliderLeadTime[1],
            title: {
               text: 'Lead Time (weeks)',
               display: true,
            },
         },
      },
      maintainAspectRatio: false,
      plugins: {
         legend: {
            display: false,
         },
         htmlLegend: {
            // ID of the container to put the legend in
            containerID: 'legend-container',
         },
         title: {
            display: true,
            text: t('competitors.playerPriceVsLeadtimeOfCompetitorMarketshare'),
            position: 'top' as const,
            align: 'start',
            font: {
               size: 15,
            },
         },
         tooltip: {
            interaction: {
               intersect: true,
               mode: 'nearest',
            },
            bodyFont: {
               size: 14,
            },
            callbacks: {
               label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                     label += ': ';
                  }
                  label += `($ ${context.parsed.y.toLocaleString()}, ${context.parsed.x.toLocaleString()} weeks, ${
                     context.raw.r
                  }%)`;

                  return label;
               },
            },
         },
         annotation: {
            annotations: {
               trendline: {
                  yMax: trendline ? sliderLeadTime[1] * trendline.m + trendline.b : 0,
                  yMin: trendline ? sliderLeadTime[0] * trendline.m + trendline.b : 0,
                  xMin: sliderLeadTime[0] ?? 0,
                  xMax: sliderLeadTime[1] ?? 0,
                  borderDash: [5, 5],
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 1,
                  BorderStyle: 'dashed',
               },
               modeline: {
                  yMax: sliderPrice[1],
                  yMin: sliderPrice[0],
                  xMin: modeline,
                  xMax: modeline,
                  borderDash: [5, 5],
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 1,
                  BorderStyle: 'dashed',
               },
            },
         },
      },
   };
   return (
      <>
         <div
         // style={{
         //    height: '100%',
         //    width: '100%',
         //    // backgroundColor: 'rgba(0,0,0, 0.3)',
         //    position: 'absolute',
         //    display: 'flex',
         //    justifyContent: 'center',
         //    alignItems: 'center',
         //    zIndex: 1000,
         // }}
         >
            {/* <CircularProgress
               color="info"
               size={60}
               sx={{
                  position: 'relative',
               }}
            /> */}
         </div>
         <AppLayout entity="indicator">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={4} sx={{ marginLeft: 0 }}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.HYGAverageStreetPrice')} ('000 USD)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {500}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.avgPriceForPlayer')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {500}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.playerHYGVariance')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(500)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
            </Grid>

            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={selectedFilter?.regions || []}
                     options={optionsFilter.regions}
                     label={t('filters.region')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'regions')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                     required
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(selectedFilter.countries, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.countries}
                     label={t('filters.country')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'countries')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={_.map(selectedFilter.classes, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.classes}
                     label={t('filters.class')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'classes')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={_.map(selectedFilter.series, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.series}
                     label={t('filters.metaSeries')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'series')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={_.map(selectedFilter.models, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.models}
                     label={t('filters.models')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'models')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(selectedFilter.groups, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.groups}
                     label={t('filters.brand-group')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'groups')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={
                        dataFilter.leadTimes !== undefined
                           ? {
                                value: `${dataFilter.leadTimes}`,
                             }
                           : { value: '' }
                     }
                     options={optionsFilter.leadTimes}
                     label={t('filters.leadTime')}
                     primaryKeyOption="value"
                     onChange={
                        (e, option) =>
                           handleChangeDataFilter(_.isNil(option) ? '' : option, 'leadTime')
                        // handleChangeDataFilter(option, 'leadTime')
                     }
                     disableClearable={false}
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleFilterIndicator}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.filter')}
                  </Button>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilterTable}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.clear')}
                  </Button>
               </Grid>

               {userRole === 'ADMIN' && (
                  <>
                     <Grid item xs={2}>
                        <UploadFileDropZone
                           handleUploadFile={handleImportFile}
                           buttonName={`${t('button.import')} Competitor File`}
                           sx={{ width: '100%', height: 24, minWidth: 165 }}
                        />
                     </Grid>
                     <Grid item xs={2}>
                        <UploadFileDropZone
                           handleUploadFile={handleUploadForecastFile}
                           buttonName={`${t('button.import')} Forecast File`}
                           sx={{ width: '100%', height: 24, minWidth: 165 }}
                        />
                     </Grid>
                  </>
               )}
            </Grid>
            <Grid
               item
               xs={12}
               justifyContent={'center'}
               alignItems={'center'}
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <div
                  style={{
                     display: 'flex',
                     flexDirection: 'row',
                     justifyContent: 'center',
                     alignItems: 'center',
                  }}
               >
                  <div style={{ height: '400px' }}>
                     <Slider
                        max={maxY}
                        value={sliderPrice}
                        onChange={(option, value) => {
                           setSliderPrice(value);
                        }}
                        orientation="vertical"
                     />
                  </div>
                  <Grid container sx={{ maxWidth: '1080px', height: '500px' }}>
                     <Bubble options={options} data={{ datasets: dataset }} />

                     <Slider
                        max={maxX}
                        style={{ width: '500px', margin: 'auto' }}
                        value={sliderLeadTime}
                        onChange={handleOnSliderChange}
                     />
                  </Grid>
                  <div id="legend-container"></div>
               </div>
            </Grid>

            <Grid item xs={12}>
               <Paper elevation={1} sx={{ marginTop: 30, position: 'relative' }}>
                  <Grid
                     container
                     sx={{ height: 'calc(67vh - 275px)', minHeight: '200px', width: '100%' }}
                  >
                     <AppDataTable
                        columnHeaderHeight={90}
                        dataFilter={dataFilter}
                        currency="USD"
                        entity="competitor-pricing"
                        rows={getDataForTable}
                        columns={columns}
                        getRowId={(params) => params.id}
                     />
                  </Grid>

                  <DataTablePagination
                     page={tableState.pageNo}
                     perPage={tableState.perPage}
                     totalItems={tableState.totalItems}
                     onChangePage={handleChangePage}
                     onChangePerPage={handleChangePerPage}
                     lastUpdatedAt={clientLatestUpdatedTime}
                     lastUpdatedBy={serverLastUpdatedBy}
                  />
                  <AppBackDrop open={loadingTable} hightHeaderTable={'102px'} />
               </Paper>
               <AppBackDrop hightHeaderTable={'35px'} bottom={'0px'} />
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
