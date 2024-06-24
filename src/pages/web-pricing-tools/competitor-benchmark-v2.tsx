import { useCallback, useMemo } from 'react';
import { Button, CircularProgress, Hidden, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppLayout, AppAutocomplete, DataTablePagination } from '@/components';
import Paper from '@mui/material/Paper';
import { paperStyle } from '@/theme/paperStyle';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import Grid from '@mui/material/Grid';
import indicatorApi from '@/api/indicators.api';
import AppDataTable from '@/components/DataTable/AppDataGridPro';
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
import Slider from '@mui/material/Slider';
import ChartAnnotation from 'chartjs-plugin-annotation';
import _, { filter } from 'lodash';
import { useEffect, useState } from 'react';
import { parseCookies } from 'nookies';
import { useDropzone } from 'react-dropzone';
import { commonStore } from '@/store/reducers';
import { indicatorV2Store } from '@/store/reducers';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import AppBackDrop from '@/components/App/BackDrop';
import { useTranslation } from 'react-i18next';
import { Bubble, Scatter } from 'react-chartjs-2';
//others
import { defaultValueChartSelectedFilterIndicator } from '@/utils/defaultValues';
//api
import indicatorV2Api from '@/api/indicatorV2.api';
//mapping
import { mappingCompetitorFiltersToOptionValues } from '@/utils/mapping';
const getOrCreateLegendList = (chart, id) => {
   const legendContainer = document.getElementById(id);
   if (!legendContainer) return null;
   let listContainer = legendContainer.querySelector('ul');

   if (!listContainer) {
      listContainer = document.createElement('ul');
      listContainer.style.display = 'flex';
      listContainer.style.flexDirection = 'column';
      listContainer.style.overflowY = 'scroll';
      listContainer.style.margin = '0';
      listContainer.style.width = '200px';
      listContainer.style.padding = '0';
      listContainer.style.height = '500px';
      listContainer.style.gap = '5px';
      legendContainer.appendChild(listContainer);
   }
   return listContainer;
};

const LoadingCurtain = ({ isLoading }) => {
   return (
      <>
         {isLoading && (
            <div
               style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  alignItems: 'center',
               }}
            >
               <CircularProgress
                  sx={{ backgroundColor: 'white', inset: 0, transform: 'translate(-50%,-50%)' }}
               />
            </div>
         )}
      </>
   );
};
const LoadingOverlay = () => {
   useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
         document.body.style.overflow = 'scroll';
      };
   }, []);
   return (
      <div
         style={{
            position: 'fixed',
            zIndex: 1000,
            inset: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.1)',
         }}
      >
         <CircularProgress sx={{ inset: 0, transform: 'translate(-50%,-50%)' }} />
      </div>
   );
};
const htmlLegendPlugin = {
   id: 'htmlLegend',
   afterUpdate(chart, args, options) {
      const ul = getOrCreateLegendList(chart, options.containerID);
      if (!ul) {
         return null;
      }
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

export default function IndicatorsV2() {
   const { t } = useTranslation();
   const dispatch = useDispatch();
   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');
   useEffect(() => {
      setUserRole(userRoleCookies);
   });
   const tableState = useSelector(commonStore.selectTableState);
   // v2
   const selectedFilter = useSelector(indicatorV2Store.selectChartSelectedFilters);
   const serverTimeZone = useSelector(indicatorV2Store.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(indicatorV2Store.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(indicatorV2Store.selectLastUpdatedBy);
   const optionsFilter = useSelector(indicatorV2Store.selectChartFilterOptions);
   const averageStats = useSelector(indicatorV2Store.selectAVGState);
   const dataTable = useSelector(indicatorV2Store.selectTableData);
   const loadingPage = useSelector(indicatorV2Store.selectLoadingPage);
   const [isUploading, setIsUploading] = useState(false);
   const [regionError, setRegionError] = useState({ error: false });
   const { dataset, trendline, modeline, maxX, maxY } = useSelector(
      indicatorV2Store.selectChartData
   );

   //setting chart Data
   const [sliderLeadTime, setSliderLeadTime] = useState([0, 0]);
   const [sliderPrice, setSliderPrice] = useState([0, 0]);

   //setting chart Data
   const [sliderLeadTimeScatter, setSliderLeadTimeScatter] = useState([0, 0]);
   const [sliderPriceScatter, setSliderPriceScatter] = useState([0, 0]);

   useEffect(() => {
      indicatorV2Api.getChartFilters(defaultValueChartSelectedFilterIndicator).then((rs) => {
         dispatch(
            indicatorV2Store.actions.setChartFilterOptions(
               mappingCompetitorFiltersToOptionValues(rs?.data)
            )
         );
      });
      let cachedFilters = null;
      try {
         cachedFilters = JSON.parse(localStorage.getItem('competitorFilters'));
      } catch (error) {}
      if (cachedFilters) {
         dispatch(indicatorV2Store.actions.setChartSelectedFilters(cachedFilters));
      }
      dispatch(indicatorV2Store.actions.setLoadingPage(true));
      dispatch(indicatorV2Store.sagaGetList());
   }, []);

   useEffect(() => {
      setSliderLeadTime([0, maxX]);
      setSliderPrice([0, maxY]);
      setSliderLeadTimeScatter([0, maxX]);
      setSliderPriceScatter([0, maxY]);
   }, [maxX, maxY]);

   const handleFetchFilter = (filters) => {
      dispatch(indicatorV2Store.actions.setLoadingPage(true));
      dispatch(indicatorV2Store.actions.setChartSelectedFilters(filters));
      if (
         !filters.region &&
         (filters.classes.length > 0 ||
            filters.metaSeries.length > 0 ||
            filters.models.length > 0 ||
            filters.groups.length > 0 ||
            filters.leadTime)
      ) {
         setRegionError({ error: true });
         dispatch(commonStore.actions.setErrorMessage(t('commonErrorMessage.selectRegion')));
         dispatch(indicatorV2Store.actions.setLoadingPage(false));
      } else {
         try {
            localStorage.setItem('competitorFilters', JSON.stringify(filters));
         } catch (error) {}
         setRegionError({ error: false });
         dispatch(commonStore.actions.setTableState({ pageNo: 1 }));
         dispatch(indicatorV2Store.sagaGetList());
      }
   };
   const handleChangeDataFilter = (option, field) => {
      const newSelectedFilter =
         field === 'region' || field === 'leadTime'
            ? { ...selectedFilter, [field]: option.value }
            : { ...selectedFilter, [field]: option?.map(({ value }) => value) };
      handleFetchFilter(newSelectedFilter);
   };

   const handleClearFilter = () => {
      handleFetchFilter(defaultValueChartSelectedFilterIndicator);
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      //prefetch table when page change
      dispatch(indicatorV2Store.fetchTable());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const handleImportFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);

      indicatorApi
         .importIndicatorFile(formData)
         .then(() => {
            setIsUploading(false);
            dispatch(commonStore.actions.setSuccessMessage('Import succesfully'));
            handleClearFilter();
         })
         .catch((error) => {
            setIsUploading(false);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleUploadForecastFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);
      indicatorApi
         .importForecastFile(formData)
         .then(() => {
            setIsUploading(false);
            dispatch(commonStore.actions.setSuccessMessage('Upload successfully'));
            handleClearFilter();
            //   handleFilterIndicator();
         })
         .catch((error) => {
            setIsUploading(false);
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const columns = [
      {
         field: 'region',
         flex: 0.7,
         minWidth: 60,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.region}</span>;
         },
      },
      {
         field: 'country',
         flex: 0.6,
         minWidth: 60,
         headerName: t('table.country'),
         renderCell(params) {
            return <span>{params.row.country}</span>;
         },
      },
      {
         field: 'clazz',
         flex: 1,
         minWidth: 60,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.class}</span>;
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
            return <span>{params.row.group}</span>;
         },
      },

      {
         field: 'HYGAverageStreetPrice',
         flex: 0.8,
         minWidth: 140,
         headerName: t('table.HYGAverageStreetPrice'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.avgStreetPrice)}</span>;
         },
      },
      {
         field: 'priceForPlayer',
         flex: 0.8,
         minWidth: 130,
         headerName: `${t('table.priceForPlayer')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.avgPrice)}</span>;
         },
      },
      {
         field: 'playerHYGVariance',
         flex: 1,
         minWidth: 100,
         headerName: `${t('table.playerHYGVariance')} `,
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span style={{ fontStyle: 'bold' }}>
                  {formatNumberPercentage(params.row.avgVariancePercentage * 100)}
               </span>
            );
         },
      },
   ];

   const clientLatestUpdatedTime = useMemo(() => {
      return serverLastUpdatedTime && serverTimeZone
         ? convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         : null;
   }, [serverLastUpdatedTime, serverTimeZone]);

   const options = {
      responsive: true,
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
                     context.raw.marketShare
                  }%)`;

                  return label;
               },
            },
         },
         annotation: {
            annotations: {
               modeline: modeline !== null && {
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

   const scatterOptions = {
      responsive: true,
      scales: {
         y: {
            beginAtZero: true,
            min: sliderPriceScatter[0],
            max: sliderPriceScatter[1],
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
            min: sliderLeadTimeScatter[0],
            max: sliderLeadTimeScatter[1],
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
            containerID: 'scater-container',
         },
         title: {
            display: true,
            text: t('competitors.playerPriceVsLeadtimeTrend'),
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
                     context.raw.marketShare
                  }%)`;

                  return label;
               },
            },
         },
         annotation: {
            annotations: {
               trendline: trendline && {
                  yMax: trendline ? sliderLeadTimeScatter[1] * trendline.m + trendline.b : 0,
                  yMin: trendline ? sliderLeadTimeScatter[0] * trendline.m + trendline.b : 0,
                  xMin: sliderLeadTimeScatter[0] ?? 0,
                  xMax: sliderLeadTimeScatter[1] ?? 0,
                  borderDash: [5, 5],
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 1,
                  BorderStyle: 'dashed',
               },
               modeline: modeline !== null && {
                  yMax: sliderPriceScatter[1],
                  yMin: sliderPriceScatter[0],
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
      <div>
         <AppLayout entity="indicatorV2">
            {isUploading && <LoadingOverlay />}
            <Grid container spacing={1} sx={{ marginBottom: 2, position: 'relative' }}>
               <Grid item xs={4} sx={{ marginLeft: 0, position: 'relative' }}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.HYGAverageStreetPrice')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(averageStats.avgStreetPrice)}
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
                           $ {formatNumber(averageStats.avgPrice)}
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
                           {formatNumberPercentage(averageStats.avgVariancePercentage * 100)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
            </Grid>

            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={
                        selectedFilter?.region != null
                           ? {
                                value: selectedFilter?.region,
                             }
                           : null
                     }
                     options={optionsFilter.regions}
                     label={t('filters.region')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'region')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     helperText="Missing value"
                     error={regionError.error}
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
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
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
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
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={_.map(selectedFilter.metaSeries, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.series}
                     label={t('filters.metaSeries')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'metaSeries')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
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
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
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
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={
                        selectedFilter?.leadTime != null
                           ? {
                                value: selectedFilter?.leadTime,
                             }
                           : null
                     }
                     options={optionsFilter?.leadTimes}
                     label={t('filters.leadTime')}
                     primaryKeyOption="value"
                     onChange={(e, option) => handleChangeDataFilter(option, 'leadTime')}
                     renderOption={(prop, { value }) => `${value || 'Others'}`}
                     getOptionLabel={(option) => `${option.value || 'Others'}`}
                  />
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearFilter}
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
            <div style={{ display: 'flex', marginTop: 50, gap: 10 }}>
               <div style={{ flex: 1, position: 'relative', minHeight: '500px' }}>
                  <LoadingCurtain isLoading={loadingPage} />
                  {!loadingPage && (
                     <div
                        style={{
                           display: 'flex',
                           flexDirection: 'row',
                           justifyContent: 'center',
                           alignItems: 'center',
                        }}
                     >
                        <div style={{ height: '300px' }}>
                           <Slider
                              max={maxY}
                              value={sliderPrice}
                              onChange={(option, value) => {
                                 setSliderPrice(value);
                              }}
                              orientation="vertical"
                           />
                        </div>
                        <div
                           style={{
                              height: '500px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                           }}
                        >
                           <Bubble options={options} data={{ datasets: dataset || [] }} />
                           <Slider
                              max={maxX}
                              style={{ width: '300px', margin: 'auto' }}
                              value={sliderLeadTime}
                              onChange={(option, value) => {
                                 setSliderLeadTime(value);
                              }}
                           />
                        </div>
                        <div>
                           <b
                              style={{
                                 fontSize: '14px',
                                 fontStyle: 'bold',
                                 marginBottom: '10px',
                                 display: 'block',
                              }}
                           >
                              Group (Brand) (groups)
                           </b>
                           <div id="legend-container" style={{ width: '200px' }}></div>
                        </div>
                     </div>
                  )}
               </div>

               <div style={{ flex: 1, position: 'relative' }}>
                  <LoadingCurtain isLoading={loadingPage} style={{ height: '500px' }} /> :
                  {!loadingPage && (
                     <div
                        style={{
                           display: 'flex',
                           flexDirection: 'row',
                           justifyContent: 'center',
                           alignItems: 'center',
                           width: '100%',
                        }}
                     >
                        <div style={{ height: '300px' }}>
                           <Slider
                              max={maxY}
                              value={sliderPriceScatter}
                              onChange={(option, value) => {
                                 setSliderPriceScatter(value);
                              }}
                              orientation="vertical"
                           />
                        </div>
                        <div
                           style={{
                              height: '500px',
                              flex: 1,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                           }}
                        >
                           <Scatter options={scatterOptions} data={{ datasets: dataset || [] }} />
                           <Slider
                              max={maxX}
                              style={{ width: '300px', margin: 'auto' }}
                              value={sliderLeadTimeScatter}
                              onChange={(option, value) => {
                                 setSliderLeadTimeScatter(value);
                              }}
                           />
                        </div>
                        <div>
                           <b
                              style={{
                                 fontSize: '14px',
                                 fontStyle: 'bold',
                                 marginBottom: '10px',
                                 display: 'block',
                              }}
                           >
                              Group (Brand) (groups)
                           </b>
                           <div id="scater-container" style={{ width: '200px' }}></div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
            <Grid item xs={12}>
               <Paper elevation={1} sx={{ marginTop: 10, position: 'relative' }}>
                  <Grid
                     container
                     sx={{ height: 'calc(67vh - 275px)', minHeight: '200px', width: '100%' }}
                  >
                     <AppDataTable
                        columnHeaderHeight={90}
                        currency="USD"
                        entity="competitor-pricing"
                        rows={dataTable}
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
                  <AppBackDrop open={loadingPage} hightHeaderTable={'102px'} />
               </Paper>
               <AppBackDrop hightHeaderTable={'35px'} bottom={'0px'} />
            </Grid>
         </AppLayout>
      </div>
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
