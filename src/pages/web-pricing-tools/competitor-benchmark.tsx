import { useCallback, useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { indicatorStore, commonStore } from '@/store/reducers';
import { Button, CircularProgress, Typography } from '@mui/material';

import { AppLayout, DataTablePagination, AppAutocomplete } from '@/components';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

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
import { Bubble } from 'react-chartjs-2';
import ChartAnnotation from 'chartjs-plugin-annotation';

import { defaultValueFilterIndicator } from '@/utils/defaultValues';
import { produce } from 'immer';
import _ from 'lodash';
import indicatorApi from '@/api/indicators.api';
import { DataGridPro, GridCellParams, GridToolbar } from '@mui/x-data-grid-pro';

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
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { useDropzone } from 'react-dropzone';

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import AppBackDrop from '@/components/App/BackDrop';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { paperStyle } from '@/theme/paperStyle';
import { useTranslation } from 'react-i18next';
import AppDataTable from '@/components/DataTable/AppDataGridPro';

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

export default function Indicators() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   const [userRole, setUserRole] = useState('');

   useEffect(() => {
      setUserRole(userRoleCookies);
   });
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

   // Select data line Chart Region in store
   // const dataForLineChartRegion = useSelector(indicatorStore.selectDataForLineChartRegion);
   // const dataForLineChartPlant = useSelector(indicatorStore.selectDataForLineChartPLant);

   const [competitiveLandscapeData, setCompetitiveLandscapeData] = useState({
      datasets: [],
      clearFilter: false,
   });

   const cachDataFilterBubbleChart = useSelector(indicatorStore.selectDataFilterBubbleChart);
   const [swotDataFilter, setSwotDataFilter] = useState(cachDataFilterBubbleChart);

   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);
   const [hasSetSwotFilter, setHasSetSwotFilter] = useState(false);

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
            handleFilterCompetitiveLandscape();
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

   const handleFilterCompetitiveLandscape = async () => {
      if (
         !competitiveLandscapeData.clearFilter &&
         JSON.stringify(swotDataFilter) !== JSON.stringify(defaultDataFilterBubbleChart)
      ) {
         setLoadingSwot(true);
      }
      try {
         console.log(swotDataFilter.regions);
         if (!swotDataFilter.regions) {
            setRegionError({ error: true });
            console.log(swotDataFilter);
            // notify error message when user select other fields but region
            if (
               !swotDataFilter.regions &&
               (swotDataFilter.countries.length > 0 ||
                  swotDataFilter.series.length > 0 ||
                  swotDataFilter.classes.length > 0 ||
                  swotDataFilter.categories.length > 0)
            ) {
               dispatch(commonStore.actions.setErrorMessage(t('commonErrorMessage.selectRegion')));
            }
            setLoadingSwot(false);
            return;
         }

         const {
            data: { competitiveLandscape },
         } = await indicatorApi.getCompetitiveLandscape({
            regions: swotDataFilter.regions,
            countries: swotDataFilter.countries,
            classes: swotDataFilter.classes,
            categories: swotDataFilter.categories,
            series: swotDataFilter.series,
         });
         const datasets = competitiveLandscape.map((item) => {
            return {
               label: `${item.color.groupName}`,
               data: [
                  {
                     y: item.competitorPricing,
                     x: item.competitorLeadTime,
                     r: (item.marketShare * 100).toLocaleString(),
                  },
               ],
               backgroundColor: `${item.color.colorCode}`,
            };
         });

         setCompetitiveLandscapeData({
            datasets: datasets,
            clearFilter: false,
         });
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
      }
   };

   //

   useEffect(() => {
      const getCountryByRegion = async () => {
         const { data } = await indicatorApi.getCountryByRegion(swotDataFilter.regions);
         return data;
      };
      getCountryByRegion()
         .then((response) => {
            const countries = response.country;
            setBubbleCountryInitFilter(() =>
               countries.map((value) => {
                  return { value: value };
               })
            );
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   }, [swotDataFilter.regions]);

   useEffect(() => {
      const getClassByFilter = async () => {
         const { data } = await indicatorApi.getClassByFilter(
            swotDataFilter.countries,
            swotDataFilter.categories,
            swotDataFilter.series
         );
         return data;
      };
      getClassByFilter()
         .then((response) => {
            const classes = response.class;
            setBubbleClassInitFilter(() =>
               classes.map((value) => {
                  return { value: value };
               })
            );
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   }, [swotDataFilter.countries, swotDataFilter.categories, swotDataFilter.series]);

   useEffect(() => {
      const getCategoryByFilter = async () => {
         const { data } = await indicatorApi.getCategoryByFilter(
            swotDataFilter.countries,
            swotDataFilter.classes,
            swotDataFilter.series
         );
         return data;
      };
      getCategoryByFilter()
         .then((response) => {
            const categories = response.category;
            setBubbleCategoryInitFilter(() =>
               categories.map((value) => {
                  return { value: value };
               })
            );
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   }, [swotDataFilter.countries, swotDataFilter.classes, swotDataFilter.series]);

   useEffect(() => {
      const getSeriesByFilter = async () => {
         const { data } = await indicatorApi.getSeriesByFilter(
            swotDataFilter.countries,
            swotDataFilter.classes,
            swotDataFilter.categories
         );
         return data;
      };
      getSeriesByFilter()
         .then((response) => {
            const series = response.series;
            setBubbleSerieInitFilter(() =>
               series.map((value) => {
                  return { value: value };
               })
            );
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   }, [swotDataFilter.countries, swotDataFilter.classes, swotDataFilter.categories]);

   const handleChangeSwotFilter = (option, field) => {
      setSwotDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['regions'], field)) {
               draft[field] = option.value;
               draft.countries = [];
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

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
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['chineseBrand', 'marginPercentage'], field)) {
               draft[field] = option.value;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(indicatorStore.sagaGetList());
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
            handleFilterCompetitiveLandscape();
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
         field: 'competitorName',
         flex: 0.8,
         minWidth: 100,
         headerName: t('competitors.competitorName'),
      },

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
         field: 'plant',
         flex: 0.6,
         minWidth: 60,
         headerName: t('table.plant'),
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
         renderCell(params) {
            return <span>{params.row.series?.series}</span>;
         },
      },

      {
         field: 'actual',
         flex: 0.6,
         minWidth: 100,
         headerName: `${currentYear - 1} Actual`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.actual}</span>;
         },
      },
      {
         field: 'aopf',
         flex: 0.6,
         minWidth: 60,
         headerName: `${currentYear} AOPF`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.aopf}</span>;
         },
      },
      {
         field: 'lrff',
         flex: 0.6,
         minWidth: 60,
         headerName: `${currentYear + 1} LRFF`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.lrff}</span>;
         },
      },
      {
         field: 'competitorLeadTime',
         flex: 0.8,
         minWidth: 60,
         headerName: t('competitors.competitorLeadTime'),
         ...formatNumbericColumn,
      },
      {
         field: 'dealerStreetPricing',
         flex: 0.8,
         minWidth: 140,
         headerName: `${t('competitors.dealerStreetPricing')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerStreetPricing)}</span>;
         },
      },
      {
         field: 'dealerHandlingCost',
         flex: 0.8,
         minWidth: 130,
         headerName: `${t('competitors.dealerHandlingCost')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerHandlingCost)}</span>;
         },
      },
      {
         field: 'competitorPricing',
         flex: 1,
         minWidth: 100,
         headerName: `${t('competitors.competitorPricing')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.competitorPricing)}</span>;
         },
      },
      {
         field: 'dealerPricingPremiumPercentage',
         flex: 1,
         minWidth: 100,
         headerName: `${t('competitors.dealerPricingPremium')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerPricingPremiumPercentage)}</span>;
         },
      },

      {
         field: 'dealerPremiumPercentage',
         flex: 1,
         minWidth: 100,
         headerName: `${t('competitors.dealerPremium')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.dealerPremiumPercentage * 100)}</span>;
         },
      },
      {
         field: 'averageDN',
         flex: 0.8,
         minWidth: 100,
         headerName: `${t('competitors.averageDealerNet')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.averageDN)}</span>;
         },
      },

      {
         field: 'variancePercentage',
         flex: 0.6,
         minWidth: 100,
         headerName: `${t('competitors.variancePercentage')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.variancePercentage * 100)}</span>;
         },
      },
   ];

   const options = {
      scales: {
         y: {
            title: {
               text: 'Price $',
               display: true,
            },
            ticks: {
               stepSize: 2000,
            },
            // beginAtZero: true,
            // title: {
            //    text: 'Lead Time (weeks)',
            //    display: true,
            // },
         },
         x: {
            beginAtZero: true,
            title: {
               text: 'Lead Time (weeks)',
               display: true,
            },
         },
      },
      maintainAspectRatio: false,
      plugins: {
         legend: {
            display: true,
         },
         title: {
            display: true,
            text: t('competitors.competitorSwotAnalysis'),
            position: 'top' as const,
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
               line1: {
                  yMax: (context) => (context.chart.scales.y.max + context.chart.scales.y.min) / 2,
                  yMin: (context) => (context.chart.scales.y.max + context.chart.scales.y.min) / 2,
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 1,
                  label: {
                     display: true,
                     content: [
                        `${t('competitors.highPrice')}, ${t('competitors.lowLeadTime')}   ${t(
                           'competitors.highPrice'
                        )}, ${t('competitors.highLeadTime')}`,
                        '',
                        `${t('competitors.lowPrice')}, ${t('competitors.lowLeadTime')}   ${t(
                           'competitors.lowPrice'
                        )}, ${t('competitors.highLeadTime')}`,
                     ],
                     backgroundColor: 'transparent',
                     width: '40%',
                     height: '40%',
                     position: 'center',
                     color: ['black'],
                     font: [
                        {
                           size: 10,
                        },
                     ],
                  },
               },
               line2: {
                  xMax: (context) => (context.chart.scales.x.max + context.chart.scales.x.min) / 2,
                  xMin: (context) => (context.chart.scales.x.max + context.chart.scales.x.min) / 2,
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 1,
               },
            },
         },
      },
   };

   const labels = [currentYear - 1, currentYear, currentYear + 1];

   const arrayColor = ['#17a9a3', '#3f0e03', '#147384', '#0048bd', '#005821', '#ec9455', '#ffafa6'];

   // const modifyDataLineChartRegion = {
   //    labels,
   //    datasets: dataForLineChartRegion.map((e, index) => ({
   //       label: e.country.region.regionName,
   //       data: [e.actual, e.aopf, e.lrff],
   //       borderColor: arrayColor[index],
   //       backgroundColor: arrayColor[index],
   //    })),
   // };

   // const modifyDataLineChartPlant = {
   //    labels,
   //    datasets: dataForLineChartPlant.map((e, index) => ({
   //       label: e.plant,
   //       data: [e.actual, e.aopf, e.lrff],
   //       borderColor: arrayColor[index],
   //       backgroundColor: arrayColor[index],
   //    })),
   // };

   // const chartScales = {
   //    y: {
   //       beginAtZero: true,
   //       title: {
   //          text: 'Quantity',
   //          display: true,
   //       },
   //    },
   //    x: {
   //       title: {
   //          text: 'Year',
   //          display: true,
   //       },
   //    },
   // };

   // handle button to clear all filters
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
   return (
      <>
         {loading ? (
            <div
               style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0, 0.3)',
                  position: 'absolute',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
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
         <AppLayout entity="indicator">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {currentYear - 1} Actual
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(listTotalRow[0]?.actual)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {currentYear} AOPF
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(listTotalRow[0]?.aopf)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {currentYear + 1} LRFF
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(listTotalRow[0]?.lrff)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('competitors.variancePercentage')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(listTotalRow[0]?.variancePercentage * 100)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('competitors.dealerStreetPricing')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.dealerStreetPricing)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('competitors.dealerHandlingCost')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.dealerHandlingCost)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('competitors.competitorPricing')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.competitorPricing)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('competitors.averageDealerNet')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.averageDN)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
            </Grid>

            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.regions, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.regions}
                     label={t('filters.region')}
                     onChange={(e, option) => handleChangeDataFilter(option, 'regions')}
                     limitTags={2}
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
                     value={_.map(dataFilter.plants, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.plants}
                     label={t('filters.plant')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'plants')}
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
                     value={_.map(dataFilter.metaSeries, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.metaSeries}
                     label={t('filters.metaSeries')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'metaSeries')}
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
                     value={_.map(dataFilter.classes, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.classes}
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
                     value={_.map(dataFilter.models, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.models}
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

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={
                        dataFilter.chineseBrand !== undefined
                           ? {
                                value: `${dataFilter.chineseBrand}`,
                             }
                           : { value: '' }
                     }
                     options={initDataFilter.chineseBrands}
                     label={t('filters.chineseBrand')}
                     onChange={
                        (e, option) =>
                           handleChangeDataFilter(_.isNil(option) ? '' : option, 'chineseBrand')
                        //   handleChangeDataFilter(option, 'chineseBrand')
                     }
                     disableClearable={false}
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     value={
                        dataFilter.marginPercentage !== undefined
                           ? {
                                value: `${dataFilter.marginPercentage}`,
                             }
                           : { value: '' }
                     }
                     options={initDataFilter.marginPercentageGrouping}
                     label={t('filters.marginPercentage')}
                     primaryKeyOption="value"
                     onChange={
                        (e, option) =>
                           handleChangeDataFilter(_.isNil(option) ? '' : option, 'marginPercentage')
                        // handleChangeDataFilter(option, 'aopMarginPercentageGroup')
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

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container sx={{ height: 'calc(67vh - 275px)', minHeight: '200px' }}>
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

            {/* <Grid
               container
               spacing={1}
               justifyContent="center"
               alignItems="center"
               sx={{ margin: '20px 0' }}
            >
               <Grid
                  item
                  xs={5}
                  sx={{
                     height: '33vh',
                     margin: 'auto',
                     position: 'relative',
                  }}
               >
                  <LineChart
                     chartData={modifyDataLineChartRegion}
                     chartName={'Forecast Volume by Year & Region'}
                     scales={chartScales}
                  />
                  <AppBackDrop
                     open={loadingTable}
                     hightHeaderTable={'40px'}
                     bottom={'25px'}
                     left={'30px'}
                  />
               </Grid>

               <Grid
                  item
                  xs={5}
                  sx={{
                     height: '33vh',
                     margin: 'auto',
                     position: 'relative',
                  }}
               >
                  <LineChart
                     chartData={modifyDataLineChartPlant}
                     chartName={'Forecast Volume by Year & Plant'}
                     scales={chartScales}
                  />
                  <AppBackDrop
                     open={loadingTable}
                     hightHeaderTable={'40px'}
                     bottom={'25px'}
                     left={'30px'}
                  />
               </Grid>
            </Grid> */}
            <Grid
               container
               spacing={1}
               justifyContent="center"
               alignItems="center"
               sx={{ margin: '20px 0' }}
            >
               <Grid container spacing={1} justifyContent="center" alignItems="center">
                  <Grid item xs={1.2} sx={{ zIndex: 15 }}>
                     <AppAutocomplete
                        value={
                           swotDataFilter.regions !== undefined
                              ? {
                                   value: `${swotDataFilter.regions}`,
                                }
                              : { value: '' }
                        }
                        options={initDataFilter.regions}
                        label={t('filters.region')}
                        onChange={(e, option) => handleChangeSwotFilter(option, 'regions')}
                        limitTags={1}
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        helperText="Missing value"
                        error={regionError.error}
                        required
                     />
                  </Grid>
                  <Grid item xs={1.2} sx={{ zIndex: 15 }}>
                     <AppAutocomplete
                        value={_.map(swotDataFilter.countries, (item) => {
                           return { value: item };
                        })}
                        options={bubbleCountryInitFilter}
                        label={t('filters.country')}
                        onChange={(e, option) => handleChangeSwotFilter(option, 'countries')}
                        limitTags={1}
                        disableListWrap
                        primaryKeyOption="value"
                        disableCloseOnSelect
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        multiple
                     />
                  </Grid>
                  <Grid item xs={1.3}>
                     <AppAutocomplete
                        value={_.map(swotDataFilter.classes, (item) => {
                           return { value: item };
                        })}
                        options={bubbleClassInitFilter}
                        label={t('filters.class')}
                        onChange={(e, option) => handleChangeSwotFilter(option, 'classes')}
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        helperText="Missing value"
                        limitTags={1}
                        disableCloseOnSelect
                        multiple
                     />
                  </Grid>
                  <Grid item xs={1.8} sx={{ zIndex: 10 }}>
                     <AppAutocomplete
                        value={_.map(swotDataFilter.categories, (item) => {
                           return { value: item };
                        })}
                        options={bubbleCategoryInitFilter}
                        label={t('filters.category')}
                        onChange={(e, option) => handleChangeSwotFilter(option, 'categories')}
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        helperText="Missing value"
                        limitTags={1}
                        disableCloseOnSelect
                        multiple
                     />
                  </Grid>
                  <Grid item xs={1.2} sx={{ zIndex: 15 }}>
                     <AppAutocomplete
                        value={_.map(swotDataFilter.series, (item) => {
                           return { value: item };
                        })}
                        options={bubbleSerieInitFilter}
                        label={t('filters.series')}
                        onChange={(e, option) => handleChangeSwotFilter(option, 'series')}
                        limitTags={1}
                        disableListWrap
                        primaryKeyOption="value"
                        disableCloseOnSelect
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        multiple
                     />
                  </Grid>

                  <Grid item xs={1.5} sx={{ zIndex: 10 }}>
                     <Button
                        variant="contained"
                        onClick={handleFilterCompetitiveLandscape}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.filter')}
                     </Button>
                  </Grid>
                  <Grid item xs={1.5}>
                     <Button
                        variant="contained"
                        onClick={handleClearAllFilterBubbleChart}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.clear')}
                     </Button>
                  </Grid>
               </Grid>
               <Grid
                  item
                  xs={9}
                  sx={{
                     height: '55vh',
                     width: 'fit-content',
                     position: 'relative',
                  }}
               >
                  <Bubble options={options} data={competitiveLandscapeData} />
                  <AppBackDrop open={loadingSwot} hightHeaderTable={'35px'} bottom={'0px'} />
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
