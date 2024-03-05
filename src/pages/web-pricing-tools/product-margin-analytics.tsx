import { useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { useDispatch, useSelector } from 'react-redux';
import { outlierStore, commonStore } from '@/store/reducers';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button, Typography } from '@mui/material';

import { AppAutocomplete, AppDateField, AppLayout, DataTablePagination } from '@/components';

import _ from 'lodash';
import { produce } from 'immer';

import { defaultValueFilterOrder } from '@/utils/defaultValues';
import { DataGridPro, GridCellParams, GridToolbar } from '@mui/x-data-grid-pro';

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
import { Scatter } from 'react-chartjs-2';
import ChartAnnotation from 'chartjs-plugin-annotation';
import outlierApi from '@/api/outlier.api';
import { formatNumber, formatNumberPercentage } from '@/utils/formatCell';
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
import moment from 'moment-timezone';

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { REGION } from '@/utils/constant';
import AppBackDrop from '@/components/App/BackDrop';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { setCookie } from 'nookies';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Outlier() {
   const paperMinWidth = 300;

   const dispatch = useDispatch();
   const listOutlier = useSelector(outlierStore.selectOutlierList);
   const initDataFilter = useSelector(outlierStore.selectInitDataFilter);
   const listTotalRow = useSelector(outlierStore.selectTotalRow);
   const cacheDataFilter = useSelector(outlierStore.selectDataFilter);
   const [dataFilter, setDataFilter] = useState(cacheDataFilter);
   const [loading, setLoading] = useState(false);
   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);
   const serverTimeZone = useSelector(outlierStore.selectServerTimeZone);
   const serverLatestUpdatedTime = useSelector(outlierStore.selectLatestUpdatedTime);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['fromDate', 'toDate', 'marginPercentage'], field)) {
               draft[field] = option;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   useEffect(() => {
      if (!hasSetDataFilter && cacheDataFilter) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            setCookie(null, 'outlierFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterOrderBooking();
         }
      }, 700);

      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   useEffect(() => {
      setLoading(false);
   }, [listOutlier]);

   const handleFilterOrderBooking = () => {
      setLoading(true);
      dispatch(outlierStore.actions.setDefaultValueFilterOutlier(dataFilter));
      handleChangePage(1);
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(outlierStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const tableState = useSelector(commonStore.selectTableState);

   const columns = [
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
         renderCell(params) {
            return <span>{params.row.region.regionName}</span>;
         },
      },
      {
         field: 'Plant',
         flex: 0.6,
         headerName: 'Plant',
         renderCell(params) {
            return <span>{params.row.product?.plant}</span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: 'Class',
         renderCell(params) {
            return <span>{params.row.product?.clazz}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.4,
         headerName: 'Series',
         renderCell(params) {
            return <span>{params.row.series}</span>;
         },
      },
      {
         field: 'model',
         flex: 0.6,
         headerName: 'Models',
         renderCell(params) {
            return <span>{params.row.product.modelCode}</span>;
         },
      },
      {
         field: 'quantity',
         flex: 0.3,
         headerName: 'Qty',
         ...formatNumbericColumn,
      },
      {
         field: 'totalCost',
         flex: 0.8,
         headerName: "Total Cost ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.totalCost)}</span>;
         },
      },
      {
         field: 'dealerNet',
         flex: 0.8,
         headerName: "DN ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNet)}</span>;
         },
      },
      {
         field: 'dealerNetAfterSurCharge',
         flex: 0.8,
         headerName: "DN After Surcharge ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNetAfterSurcharge)}</span>;
         },
      },
      {
         field: 'marginAfterSurCharge',
         flex: 0.7,
         headerName: "Margin $ After Surcharge ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.marginAfterSurcharge)}</span>;
         },
      },

      {
         field: 'marginPercentageAfterSurCharge',
         flex: 0.6,
         headerName: 'Margin % After Surcharge',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(params?.row.marginPercentageAfterSurcharge * 100)}
               </span>
            );
         },
      },
   ];

   const options = {
      scales: {
         x: {
            beginAtZero: true,
            title: {
               text: 'Margin % After Surcharge',
               display: true,
            },
            ticks: {
               stepSize: 2,
               callback: function (value) {
                  return value + '%';
               },
            },
         },
         y: {
            title: {
               text: 'Dealer Net $',
               display: true,
            },
            ticks: {
               callback: function (value) {
                  return '$' + value.toLocaleString();
               },
            },
         },
      },
      maintainAspectRatio: false,

      plugins: {
         title: {
            display: true,
            text: 'Outliers Discussion',
            position: 'top' as const,
         },
         tooltip: {
            interaction: {
               intersect: true,
               mode: 'nearest',
            },
            callbacks: {
               label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                     label += ': ';
                  }

                  label += `($ ${context.parsed.y.toLocaleString()}, ${context.parsed.x.toLocaleString()}%, ${
                     context.raw.modelCode
                  })`;

                  return label;
               },
            },
         },
         annotation: {
            annotations: {
               line1: {
                  xMax: (context) => context.chart.scales.x.max * 0.25,
                  xMin: (context) => context.chart.scales.x.max * 0.25,
                  borderDash: [5, 5],
                  borderWidth: 2,
                  label: {
                     display: true,
                     content: '25%',
                     backgroundColor: 'transparent',
                     position: 'end',
                     color: ['black'],
                     xAdjust: -10,
                     rotation: -90,
                     font: [
                        {
                           size: 12,
                        },
                     ],
                  },
               },
               line2: {
                  xMax: (context) => context.chart.scales.x.max * 0.75,
                  xMin: (context) => context.chart.scales.x.max * 0.75,
                  borderDash: [5, 5],
                  borderWidth: 2,
                  label: {
                     display: true,
                     content: '75%',
                     backgroundColor: 'transparent',
                     position: 'end',
                     color: ['black'],
                     xAdjust: -10,
                     rotation: -90,
                     font: [
                        {
                           size: 12,
                        },
                     ],
                  },
               },
            },
         },
      },
      elements: {
         point: {
            radius: 7,
         },
      },
   };

   const [chartOutliersData, setChartOutliersData] = useState({
      datasets: [],
   });

   useEffect(() => {
      getOutliersDataForChart();
      console.log('Outliers', chartOutliersData);
   }, [listOutlier]);

   const getOutliersDataForChart = async () => {
      try {
         let {
            data: { chartOutliersData },
         } = await outlierApi.getOutliersForChart(dataFilter);

         chartOutliersData = chartOutliersData.filter((item) => item[0]?.region != null);

         const datasets = chartOutliersData.map((item) => {
            if (item[0]?.region != null) {
               const regionData = item.map((obj) => {
                  return {
                     x: (obj.marginPercentageAfterSurcharge * 100).toLocaleString(),
                     y: obj.dealerNet,
                     modelCode: obj.modelCode,
                  };
               });

               return {
                  label: item[0]?.region,
                  data: regionData.map((item) => item),
                  backgroundColor: REGION[item[0]?.region],
               };
            }
         });
         setChartOutliersData({
            datasets: datasets,
         });
      } catch (e) {
         console.log(e);
      }
   };

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setDataFilter(defaultValueFilterOrder);
   };

   // show latest updated time
   const convertServerTimeToClientTimeZone = () => {
      if (serverLatestUpdatedTime && serverTimeZone) {
         const clientTimeZone = moment.tz.guess();
         const convertedTime = moment
            .tz(serverLatestUpdatedTime, serverTimeZone)
            .tz(clientTimeZone);
         setClientLatestUpdatedTime(convertedTime.format('YYYY-MM-DD HH:mm'));
         console.log('Converted Time:', convertedTime.format());
      }
   };

   useEffect(() => {
      convertServerTimeToClientTimeZone();
   }, [serverLatestUpdatedTime, serverTimeZone]);

   return (
      <>
         <AppLayout entity="outlier">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={2.4}>
                  <Paper
                     elevation={2}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: paperMinWidth,
                        backgroundColor: '#e7a800',
                        border: '1px solid #e7a800',
                        ':hover': {
                           border: '1px solid black',
                        },
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           Total Cost ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.dealerNet)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper
                     elevation={2}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: paperMinWidth,
                        backgroundColor: '#e7a800',
                        border: '1px solid #e7a800',
                        ':hover': {
                           border: '1px solid black',
                        },
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           Dealer Net('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.dealerNetAfterSurcharge)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper
                     elevation={2}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: paperMinWidth,
                        backgroundColor: '#e7a800',
                        border: '1px solid #e7a800',
                        ':hover': {
                           border: '1px solid black',
                        },
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           Dealer Net After Surcharge ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.totalCost)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper
                     elevation={2}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: paperMinWidth,
                        backgroundColor: '#e7a800',
                        border: '1px solid #e7a800',
                        ':hover': {
                           border: '1px solid black',
                        },
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           Margin $ After Surcharge ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.marginAfterSurcharge)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper
                     elevation={2}
                     sx={{
                        padding: 2,
                        height: 'fit-content',
                        minWidth: paperMinWidth,
                        backgroundColor: '#e7a800',
                        border: '1px solid #e7a800',
                        ':hover': {
                           border: '1px solid black',
                        },
                     }}
                  >
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           Margin % After Surcharge
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(
                              listTotalRow[0]?.marginPercentageAfterSurcharge * 100
                           )}
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
                     label="Region"
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
                     label="Plant"
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
                     label="MetaSeries"
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.dealers, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.dealers}
                     label="Dealer"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'dealers')}
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
                     label="Class"
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
                     label="Model"
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
                        dataFilter.marginPercentage !== undefined
                           ? {
                                value: `${dataFilter.marginPercentage}`,
                             }
                           : { value: '' }
                     }
                     options={initDataFilter.marginPercentageGroup}
                     label="Margin %"
                     onChange={(e, option) =>
                        handleChangeDataFilter(
                           _.isNil(option) ? '' : option?.value,
                           'marginPercentage'
                        )
                     }
                     disableClearable={false}
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppDateField
                     label="From Date"
                     name="from_date"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'fromDate')
                     }
                     value={dataFilter?.fromDate}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppDateField
                     label="To Date"
                     name="toDate"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'toDate')
                     }
                     value={dataFilter?.toDate}
                  />
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleFilterOrderBooking}
                     sx={{ width: '100%', height: 24 }}
                  >
                     Filter
                  </Button>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilters}
                     sx={{ width: '100%', height: 24 }}
                  >
                     Clear
                  </Button>
               </Grid>
            </Grid>
            <Grid
               sx={{
                  position: 'relative',
               }}
            >
               <Grid
                  sx={{
                     height: '35vh',
                  }}
               >
                  <Scatter options={options} data={chartOutliersData} />
               </Grid>

               <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
                  <Grid container sx={{ height: 'calc(58vh - 238px)' }}>
                     <DataGridPro
                        sx={{
                           '& .MuiDataGrid-columnHeaderTitle': {
                              textOverflow: 'clip',
                              whiteSpace: 'break-spaces',
                              lineHeight: 1.2,
                           },
                        }}
                        columnHeaderHeight={50}
                        hideFooter
                        disableColumnMenu
                        // tableHeight={740}
                        rowHeight={35}
                        rows={listOutlier}
                        slots={{
                           toolbar: GridToolbar,
                        }}
                        rowBuffer={35}
                        rowThreshold={25}
                        columns={columns}
                        getRowId={(params) => params.orderNo}
                     />
                  </Grid>

                  <Grid sx={{ display: 'flex', justifyContent: 'right', width: 'match-parent' }}>
                     <Typography sx={{ marginRight: 1, marginTop: 1 }}>
                        Last updated at {clientLatestUpdatedTime}
                     </Typography>
                  </Grid>

                  <DataTablePagination
                     page={tableState.pageNo}
                     perPage={tableState.perPage}
                     totalItems={tableState.totalItems}
                     onChangePage={handleChangePage}
                     onChangePerPage={handleChangePerPage}
                  />
               </Paper>
               <AppBackDrop open={loading} hightHeaderTable={'35px'} bottom={'43px'} />
            </Grid>
         </AppLayout>
      </>
   );
}
