import { useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { useDispatch, useSelector } from 'react-redux';
import { outlierStore, commonStore } from '@/store/reducers';
import { DataGrid } from '@mui/x-data-grid';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppTextField,
   DataTable,
   DataTablePagination,
} from '@/components';

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
import axios from 'axios';
import { parseCookies } from 'nookies';
import { rowColor } from '@/theme/colorRow';

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Outlier() {
   const dispatch = useDispatch();
   const listOutlier = useSelector(outlierStore.selectOutlierList);
   const initDataFilter = useSelector(outlierStore.selectInitDataFilter);
   const listTotalRow = useSelector(outlierStore.selectTotalRow);
   const [dataFilter, setDataFilter] = useState(defaultValueFilterOrder);

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['fromDate', 'toDate', 'MarginPercetage'], field)) {
               draft[field] = option;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   const handleFilterOrderBooking = () => {
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
            return <span>{params.row.metaSeries}</span>;
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

   const totalColumns = [
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
         renderCell(params) {
            return <span>Total</span>;
         },
      },
      {
         field: 'Plant',
         flex: 0.6,
         headerName: 'Plant',
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: 'Class',
      },
      {
         field: 'series',
         flex: 0.4,
         headerName: 'Series',
      },
      {
         field: 'model',
         flex: 0.6,
         headerName: 'Models',
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
         headerName: 'Total Cost',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.totalCost)}</span>;
         },
      },
      {
         field: 'dealerNet',
         flex: 0.8,
         headerName: 'DN',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNet)}</span>;
         },
      },
      {
         field: 'dealerNetAfterSurCharge',
         flex: 0.8,
         headerName: 'DN After Surcharge',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNetAfterSurcharge)}</span>;
         },
      },
      {
         field: 'marginAfterSurCharge',
         flex: 0.7,
         headerName: 'Margin $ After Surcharge',
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
                     content: (context) =>
                        '25%: ' + (context.chart.scales.x.max * 0.25).toLocaleString() + '%',
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
                     content: (context) =>
                        '75%: ' + (context.chart.scales.x.max * 0.75).toLocaleString() + '%',
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

         const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);

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
                  backgroundColor: `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`,
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

   return (
      <>
         <AppLayout entity="outlier">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
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
                     options={initDataFilter.MarginPercetage}
                     label="Margin %"
                     onChange={(e, option) =>
                        handleChangeDataFilter(
                           _.isNil(option) ? '' : option?.value,
                           'MarginPercetage'
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
               <Grid item xs={2}>
                  <Button
                     variant="contained"
                     onClick={handleFilterOrderBooking}
                     sx={{ width: '100%', height: 24 }}
                  >
                     Filter
                  </Button>
               </Grid>
            </Grid>

            <Grid
               sx={{
                  height: '38vh',
               }}
            >
               <Scatter options={options} data={chartOutliersData} />
            </Grid>

            <Paper elevation={1} sx={{ marginTop: 2 }}>
               <Grid container sx={{ height: 'calc(60vh - 231px)' }}>
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
               <DataGridPro
                  sx={rowColor}
                  getCellClassName={(params: GridCellParams<any, any, number>) => {
                     return 'total';
                  }}
                  hideFooter
                  columnHeaderHeight={0}
                  disableColumnMenu
                  rowHeight={30}
                  rows={listTotalRow}
                  rowBuffer={35}
                  rowThreshold={25}
                  columns={totalColumns}
                  getRowId={(params) => params.dealerNet}
               />
               <DataTablePagination
                  page={tableState.pageNo}
                  perPage={tableState.perPage}
                  totalItems={tableState.totalItems}
                  onChangePage={handleChangePage}
                  onChangePerPage={handleChangePerPage}
               />
            </Paper>
         </AppLayout>
      </>
   );
}
