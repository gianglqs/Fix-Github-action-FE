import { useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { indicatorStore, commonStore } from '@/store/reducers';
import { Button } from '@mui/material';

import { rowColor } from '@/theme/colorRow';
import { AppLayout, DataTablePagination, DataTable, AppAutocomplete } from '@/components';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import LineChart from '@/components/chart/Line';

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
import { faker } from '@faker-js/faker';

import { defaultValueFilterIndicator } from '@/utils/defaultValues';
import { produce } from 'immer';
import _ from 'lodash';
import indicatorApi from '@/api/indicators.api';
import { relative } from 'path';
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
import axios from 'axios';
import { parseCookies } from 'nookies';

export async function getServerSideProps(context) {
   try {
      let cookies = parseCookies(context);
      let token = cookies['token'];
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkToken`, null, {
         headers: {
            Authorization: 'Bearer ' + token,
         },
      });

      return {
         props: {},
      };
   } catch (error) {
      console.error('token error', error);

      return {
         redirect: {
            destination: '/login',
            permanent: false,
         },
      };
   }
}

export default function Indicators() {
   const dispatch = useDispatch();

   const tableState = useSelector(commonStore.selectTableState);

   // select data Filter in store
   const initDataFilter = useSelector(indicatorStore.selectInitDataFilter);
   console.log(initDataFilter);

   const [dataFilter, setDataFilter] = useState(defaultValueFilterIndicator);
   const listTotalRow = useSelector(indicatorStore.selectTotalRow);

   const getDataForTable = useSelector(indicatorStore.selectIndicatorList);

   // Select data line Chart Region in store
   const dataForLineChartRegion = useSelector(indicatorStore.selectDataForLineChartRegion);
   const dataForLineChartPlant = useSelector(indicatorStore.selectDataForLineChartPLant);

   const [competitiveLandscapeData, setCompetitiveLandscapeData] = useState({
      datasets: [],
   });
   const [swotDataFilter, setSwotDataFilter] = useState({
      regions: null,
      countries: [],
      classes: null,
      categories: null,
      series: [],
   });

   const [regionError, setRegionError] = useState(false);
   const [classesError, setClassesError] = useState(false);
   const [categoriesError, setCategoriesError] = useState(false);

   const handleFilterCompetitiveLandscape = async () => {
      try {
         if (swotDataFilter.regions == null) {
            setRegionError(true);
            return;
         }
         if (swotDataFilter.classes == null) {
            setClassesError(true);
            return;
         }
         if (swotDataFilter.categories == null) {
            setCategoriesError(true);
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
         let totalPrice = 0;
         let totalLeadTime = 0;
         const datasets = competitiveLandscape.map((item) => {
            totalPrice += item.competitorPricing;
            totalLeadTime += item.competitorLeadTime;

            return {
               label: `${item.competitorName} (${item.country.countryName}, ${item.series})`,
               data: [
                  {
                     x: item.competitorPricing,
                     y: item.competitorLeadTime,
                     r: (item.marketShare * 100).toLocaleString(),
                  },
               ],
               backgroundColor: `${item.color.colorCode}`,
            };
         });

         setCompetitiveLandscapeData({
            datasets: datasets,
         });
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error.message));
      }
   };

   const handleChangeSwotFilter = (option, field) => {
      setSwotDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['regions', 'classes', 'categories'], field)) {
               draft[field] = option.value;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
      if (swotDataFilter.regions != null) setRegionError(false);
      if (swotDataFilter.classes != null) setClassesError(false);
      if (swotDataFilter.categories != null) setCategoriesError(false);
   };

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
      dispatch(indicatorStore.actions.setDefaultValueFilterIndicator(dataFilter));
      handleChangePage(1);
   };

   const columns = [
      {
         field: 'competitorName',
         flex: 1.5,
         headerName: 'Competitor Name',
      },

      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
      },
      {
         field: 'plant',
         flex: 0.8,
         headerName: 'Plant',
      },
      {
         field: 'clazz',
         flex: 1,
         headerName: 'Class',
      },
      {
         field: 'series',
         flex: 0.5,
         headerName: 'Series',
      },

      {
         field: 'actual',
         flex: 0.5,
         headerName: '2022 Actual',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.actual}</span>;
         },
      },
      {
         field: 'aopf',
         flex: 0.5,
         headerName: '2023 AOPF',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.aopf}</span>;
         },
      },
      {
         field: 'lrff',
         flex: 0.5,
         headerName: '2024 LRFF',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.lrff}</span>;
         },
      },
      {
         field: 'competitorLeadTime',
         flex: 0.8,
         headerName: 'Competitor Lead Time',
         ...formatNumbericColumn,
      },
      {
         field: 'dealerStreetPricing',
         flex: 0.8,
         headerName: "Dealer Street Pricing ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerStreetPricing)}</span>;
         },
      },
      {
         field: 'dealerHandlingCost',
         flex: 0.8,
         headerName: "Dealer Handling Cost ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerHandlingCost)}</span>;
         },
      },
      {
         field: 'competitorPricing',
         flex: 1,
         headerName: "Competition Pricing ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.competitorPricing)}</span>;
         },
      },
      {
         field: 'dealerPricingPremiumPercentage',
         flex: 1,
         headerName: "Dealer Pricing Premium/Margin ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerPricingPremiumPercentage)}</span>;
         },
      },

      {
         field: 'dealerPremiumPercentage',
         flex: 1,
         headerName: 'Dealer Premium / Margin %',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.dealerPremiumPercentage * 100)}</span>;
         },
      },
      {
         field: 'averageDN',
         flex: 0.8,
         headerName: "Average Dealer Net ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.averageDN)}</span>;
         },
      },

      {
         field: 'variancePercentage',
         flex: 1,
         headerName: 'Varian % (Competitor - (Dealer Street + Premium))',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.variancePercentage * 100)}</span>;
         },
      },
   ];

   const totalColumns = [
      {
         field: 'competitorName',
         flex: 1.5,
         headerName: 'Competitor Name',
      },

      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
      },
      {
         field: 'plant',
         flex: 0.8,
         headerName: 'Plant',
      },
      {
         field: 'clazz',
         flex: 1,
         headerName: 'Class',
      },
      {
         field: 'series',
         flex: 0.5,
         headerName: 'Series',
      },

      {
         field: 'actual',
         flex: 0.5,
         headerName: '2022 Actual',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.actual}</span>;
         },
      },
      {
         field: 'aopf',
         flex: 0.5,
         headerName: '2023 AOPF',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.aopf}</span>;
         },
      },
      {
         field: 'lrff',
         flex: 0.5,
         headerName: '2024 LRFF',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.lrff}</span>;
         },
      },
      {
         field: 'competitorLeadTime',
         flex: 0.8,
         headerName: 'Competitor Lead Time',
         ...formatNumbericColumn,
      },
      {
         field: 'dealerStreetPricing',
         flex: 0.8,
         headerName: 'Dealer Street Pricing(USD)',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerStreetPricing)}</span>;
         },
      },
      {
         field: 'dealerHandlingCost',
         flex: 0.8,
         headerName: 'Dealer Handling Cost',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerHandlingCost)}</span>;
         },
      },
      {
         field: 'competitorPricing',
         flex: 1,
         headerName: 'Competition Pricing (USD)',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.competitorPricing)}</span>;
         },
      },
      {
         field: 'dealerPricingPremiumPercentages',
         flex: 1,
         headerName: 'Dealer Pricing Premium/Margin (USD)',
         ...formatNumbericColumn,
      },

      {
         field: 'dealerPremiumPercentages',
         flex: 1,
         headerName: 'Dealer Premium / Margin %',
         ...formatNumbericColumn,
      },
      {
         field: 'averageDN',
         flex: 0.8,
         headerName: 'Average Dealer Net',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.averageDN)}</span>;
         },
      },

      {
         field: 'variancePercentage',
         flex: 1,
         headerName: 'Varian % (Competitor - (Dealer Street + Premium))',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.variancePercentage)}</span>;
         },
      },
   ];

   const options = {
      scales: {
         y: {
            beginAtZero: true,
            title: {
               text: 'Lead Time (weeks)',
               display: true,
            },
         },
         x: {
            title: {
               text: 'Price $',
               display: true,
            },
            ticks: {
               stepSize: 2000,
            },
         },
      },
      maintainAspectRatio: false,
      plugins: {
         legend: {
            position: 'left' as const,
         },
         title: {
            display: true,
            text: 'Competitor Swot Analysis',
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
                  console.log(context);
                  label += `($ ${context.parsed.x.toLocaleString()}, ${context.parsed.y.toLocaleString()} weeks, ${
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
                        'Low Price, High Lead Time   High Price, High Lead Time',
                        '',
                        'Low Price, Low Lead Time   High Price, Low Lead Time',
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

   const labels = [2022, 2023, 2024];

   const currentDate = new Date();

   let year = currentDate.getFullYear();

   //create array Year use to Label, vd: 2022,2023,2024,2025,...
   const arrayYear = Array.from({ length: 3 }, (_, i) => i + year - 1);

   const arrayColor = ['#17a9a3', '#3f0e03', '#147384', '#0048bd', '#005821', '#ec9455', '#ffafa6'];

   const modifyDataLineChartRegion = {
      labels,
      datasets: dataForLineChartRegion.map((e, index) => ({
         label: e.region,
         data: [e.actual, e.aopf, e.lrff],
         borderColor: arrayColor[index],
         backgroundColor: arrayColor[index],
      })),
   };

   const modifyDataLineChartPlant = {
      labels,
      datasets: dataForLineChartPlant.map((e, index) => ({
         label: e.plant,
         data: [e.actual, e.aopf, e.lrff],
         borderColor: arrayColor[index],
         backgroundColor: arrayColor[index],
      })),
   };

   const chartScales = {
      y: {
         beginAtZero: true,
         title: {
            text: 'Quantity',
            display: true,
         },
      },
      x: {
         title: {
            text: 'Year',
            display: true,
         },
      },
   };

   // create scrollbar for table

   return (
      <>
         <AppLayout entity="indicator">
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
                     options={initDataFilter.chineseBrands}
                     label="Chinese Brand"
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
                     options={initDataFilter.marginPercentageGrouping}
                     label="Margin % Group"
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

               <Grid item xs={2}>
                  <Button
                     variant="contained"
                     onClick={handleFilterIndicator}
                     sx={{ width: '100%', height: 24 }}
                  >
                     Filter
                  </Button>
               </Grid>
            </Grid>
            <Paper elevation={1} sx={{ marginTop: 2 }}>
               <Grid container sx={{ height: 'calc(67vh - 275px)', minHeight: '200px' }}>
                  <DataGridPro
                     hideFooter
                     disableColumnMenu
                     // tableHeight={390}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rowHeight={35}
                     rows={getDataForTable}
                     rowBuffer={35}
                     rowThreshold={25}
                     columns={columns}
                     getRowId={(params) => params.id}
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
                  getRowId={(params) => params.id}
               />
               <DataTablePagination
                  page={tableState.pageNo}
                  perPage={tableState.perPage}
                  totalItems={tableState.totalItems}
                  onChangePage={handleChangePage}
                  onChangePerPage={handleChangePerPage}
               />
            </Paper>

            <Grid
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
               </Grid>
            </Grid>
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
                        options={initDataFilter.regions}
                        label="Region"
                        onChange={(e, option) => handleChangeSwotFilter(option, 'regions')}
                        limitTags={2}
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        helperText="Missing value"
                        error={regionError}
                        required
                     />
                  </Grid>
                  <Grid item xs={1.2} sx={{ zIndex: 15 }}>
                     <AppAutocomplete
                        options={initDataFilter.countries}
                        label="Country"
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
                  <Grid item xs={1.2}>
                     <AppAutocomplete
                        options={initDataFilter.classes}
                        label="Competitor Class"
                        onChange={(e, option) => handleChangeSwotFilter(option, 'classes')}
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        error={classesError}
                        helperText="Missing value"
                        required
                     />
                  </Grid>
                  <Grid item xs={1.5} sx={{ zIndex: 10 }}>
                     <AppAutocomplete
                        options={initDataFilter.categories}
                        label="Category"
                        onChange={(e, option) => handleChangeSwotFilter(option, 'categories')}
                        disableListWrap
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => `${option.value}`}
                        error={categoriesError}
                        helperText="Missing value"
                        required
                     />
                  </Grid>
                  <Grid item xs={1.2} sx={{ zIndex: 15 }}>
                     <AppAutocomplete
                        options={initDataFilter.series}
                        label="Series"
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
                        Filter
                     </Button>
                  </Grid>
               </Grid>
               <Grid
                  item
                  xs={10}
                  sx={{
                     height: '55vh',
                     margin: 'auto',
                     position: 'relative',
                  }}
               >
                  <Bubble options={options} data={competitiveLandscapeData} />
               </Grid>
            </Grid>
         </AppLayout>
      </>
   );
}
