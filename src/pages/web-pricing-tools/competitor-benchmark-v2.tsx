import { useCallback } from 'react';
import { Button, CircularProgress, Typography } from '@mui/material';
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
import chartTrendline from 'chartjs-plugin-trendline';
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
import { BorderStyle } from '@mui/icons-material';


ChartJS.register(
   CategoryScale,
   chartTrendline,
   LinearScale,
   PointElement,
   LineElement,
   Tooltip,
   Legend,
   Title,
   ChartAnnotation
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
   const chartData = useSelector(indicatorV2Store.selectChartData);
   const [sliderLeadTime,setSliderLeadTime] = useState([0,50]);

   const [competitiveLandscapeData, setCompetitiveLandscapeData] = useState({
      datasets: [],
      clearFilter: false,
   });

   const cachDataFilterBubbleChart = useSelector(indicatorStore.selectDataFilterBubbleChart);
   const [swotDataFilter, setSwotDataFilter] = useState(cachDataFilterBubbleChart);

   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);
   const [hasSetSwotFilter, setHasSetSwotFilter] = useState(false);

   const datasets = chartData.dataset.map((item) => {
      return {
         label: `${item.color.groupName}`,
         data: [
            {
               y: item.competitorPricing,
               x: item.competitorLeadTime,
               r:4,
            },
         ],
         backgroundColor: `${item.color.colorCode}`,
      };
   });
   const trendline = chartData.trendline
   useEffect(()=>{
      console.log(selectedFilter);
      dispatch(indicatorV2Store.sagaGetList());
      },[])

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
         if (!swotDataFilter.regions) {
            setRegionError({ error: true });
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
      console.log("option la: ",option);

      const newSelectedFilter  = (field == "regions") ? 
       {...selectedFilter,[field]:option.value} : 
       {...selectedFilter,[field]:option?.map(({value}) => value)};
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

   const handleOnSliderChange = (option,value) =>{
      setSliderLeadTime(value);
   }
   const options = {
      legend: { 
         position: 'right' 
     },
      scales: {
         y: {
            title: {
               text: 'Price $',
               display: true,
            },
            ticks: {
               stepSize:2000,
            },
            // beginAtZero: true,
            // title: {
            //    text: 'Lead Time (weeks)',
            //    display: true,
            // },
         },
         xAxes: [{
            gridLines: {
                // You can change the color, the dash effect, the main axe color, etc.
                borderDash: [8, 4],
                color: "#348632"
            }
        }],
         x: {
            beginAtZero: true,
            min:sliderLeadTime[0],
            max:sliderLeadTime[1],
            gridLines: {
               // You can change the color, the dash effect, the main axe color, etc.
               borderDash: [8, 4],
               color: "#348632"
           },
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
            position: 'right' ,
            
            
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
               trendline: {
                  yMax:trendline? sliderLeadTime[0]*trendline.m+trendline.b :0,
                  yMin: trendline? sliderLeadTime[1]*trendline.m+trendline.b : 0,
                  borderDash: [5, 5] ,// Set the border to dashed style
                  borderColor: 'rgb(0, 0, 0)',
                  borderWidth: 1,
                  BorderStyle:"dashed",
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
                     value={selectedFilter?.regions||[]}
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
            <Grid item xs={6} justifyContent={'center'} alignItems={"center"} style={{display: "flex", flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
               <div  style={{display: "flex", flexDirection:"row",justifyContent:"center",alignItems:"center"}}>
                  <div style={{height:'400px'}}> 
                     <Slider
                     sx={{
                        '& input[type="range"]': {
                           WebkitAppearance: 'slider-vertical',
                        },
                     }}
                     orientation="vertical"
                     defaultValue={30}
                     />
                  </div>
                  <Grid
                     container
                     sx={{height:"500px", width: '100%' }}
                  >
                     <Bubble options={options} data={{datasets}} />
                     <Slider style={{width:'500px'}} value={sliderLeadTime} onChange = {handleOnSliderChange}/>
                     </Grid>
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
