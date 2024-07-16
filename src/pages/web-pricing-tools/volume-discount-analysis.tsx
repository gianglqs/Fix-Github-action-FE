import { useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { useDispatch } from 'react-redux';
import { commonStore, volumeDiscountStore } from '@/store/reducers';
import { Button } from '@mui/material';

import { AppAutocomplete, AppLayout, AppNumberField, AppTextField } from '@/components';
import AppDataTable from '@/components/DataTable/AppDataGridPro';
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
import ChartAnnotation from 'chartjs-plugin-annotation';

import { produce } from 'immer';
import _ from 'lodash';
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro';

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
import AppBackDrop from '@/components/App/BackDrop';
import { useTranslation } from 'react-i18next';
import volumeDiscountApi from '@/api/volume-discount.api';
import { formatNumberPercentage } from '@/utils/formatCell';
import { useSelector } from 'react-redux';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { setCookie } from 'nookies';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function VolumeDiscountAnalysis() {
   const dispatch = useDispatch();
   const { t } = useTranslation();
   const [loading, setLoading] = useState(false);

   const [volumeDiscountData, setVolumeDiscountData] = useState([]);
   const [chartData, setChartData] = useState({ labels: [], datasets: [] });

   const initDataFilter = useSelector(volumeDiscountStore.selectInitDataFilter);
   const cacheDataFilter = useSelector(volumeDiscountStore.selectDataFilter);
   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   useEffect(() => {
      if (cacheDataFilter) {
         setDataFilter(cacheDataFilter);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            setCookie(null, 'volumeDiscountFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
         }
      }, 700);
      handleCalculateVolumeDiscount();
      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   // handle button to clear all filters
   const handleClearAllFilterTable = () => {
      setDataFilter({
         pricePerUnit: { value: '', error: false },
         costOfGoodSold: { value: '', error: false },
         discountPercentage: { value: '', error: false },
         lever: { value: '', error: false },
         expectedUnitSales: { value: '', error: false },
         ocos: { value: '', error: false },
         segment: { value: '', error: false },
      });
   };
   const handleCalculateVolumeDiscount = async () => {
      if (dataFilter.discountPercentage?.value > 100) {
         dispatch(
            commonStore.actions.setErrorMessage(
               'Input value out of range. Please enter a value from 0 to 100.'
            )
         );
      } else {
         try {
            setLoading(true);
            const {
               data: { volumeDiscountAnalysis },
            } = await volumeDiscountApi.calculateVolumeDiscount({
               pricePerUnit: dataFilter.pricePerUnit?.value,
               costOfGoodSold: dataFilter.costOfGoodSold?.value,
               discountPercentage: dataFilter.discountPercentage?.value / 100,
               lever: dataFilter.lever?.value,
               expectedUnitSales: dataFilter.expectedUnitSales?.value,
               ocos: dataFilter.ocos?.value,
            });
            setVolumeDiscountData(volumeDiscountAnalysis);

            const labels = volumeDiscountAnalysis.map(({ volume }) => volume);
            const datasets = [
               {
                  label:
                     grossProfitSegments.find((item) => item == dataFilter.segment?.value) !=
                     undefined
                        ? t('volumeDiscount.grossProfit')
                        : t('volumeDiscount.standardMargin'),
                  data: volumeDiscountAnalysis.map((item) => item.standardMargin),
                  fill: false,
                  borderColor: 'rgb(75, 192, 192)',
                  tension: 0.1,
               },
            ];
            setChartData({ labels, datasets });
         } catch (error) {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         } finally {
            setLoading(false);
         }
      }
   };

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            draft[field].value = option;
         })
      );
   };

   const tooltip = {
      callbacks: {
         title: () => {
            return '';
         },
         label: (context) => {
            console.log(context);
            return `Standard Margin of ${context.label}: $ ${context.parsed.y.toLocaleString()}`;
         },
      },
   };

   const columns = [
      {
         field: 'volume',
         flex: 0.8,
         minWidth: 100,
         headerName: '',
         renderCell(params) {
            return <span>{params?.row != null ? `Price of ${params?.row.volume}` : ''}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },

      {
         field: 'discountAdded',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.discountAdded'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.discountAdded * 100)}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },

      {
         field: 'totalDiscount',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.totalDiscount'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.totalDiscount * 100)}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'pricePerUnit',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.pricePerUnit'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.pricePerUnit.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'totalPrice',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.totalPrice'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.totalPrice.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'costOfGoodSold',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.costOfGoodSold'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.costOfGoodSold.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },

      {
         field: 'standardMargin',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.standardMargin'),
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span
                  style={{
                     fontWeight: 'bold',
                  }}
               >
                  {params?.row.standardMargin.toLocaleString()}
               </span>
            );
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'standardMarginPercentage',
         flex: 0.8,
         minWidth: 100,
         headerName: `${t('volumeDiscount.standardMargin')} %`,
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>{formatNumberPercentage(params?.row.standardMarginPercentage * 100)}</span>
            );
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'averageStandardMargin',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.averageStandardMargin'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.averageStandardMargin.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'expectedUnitSales',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.expectedUnitSales'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.expectedUnitSales.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'revenue',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.revenue'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.revenue.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'standardMarginOnUnitSales',
         flex: 0.8,
         minWidth: 100,
         headerName: `${t('volumeDiscount.standardMargin')} (EUS)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.standardMarginOnUnitSales.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'ocos',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.ocos'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.ocos.toLocaleString()}</span>;
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'adjustedStandardMargin',
         flex: 0.8,
         minWidth: 100,
         headerName: t('volumeDiscount.adjustedStandardMargin'),
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span
                  style={{
                     fontWeight: 'bold',
                  }}
               >
                  {params?.row.adjustedStandardMargin.toLocaleString()}
               </span>
            );
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
      {
         field: 'adjustedStandardMarginPercentage',
         flex: 0.8,
         minWidth: 100,
         headerName: `${t('volumeDiscount.adjustedStandardMargin')} %`,
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(
                     params?.row.adjustedStandardMarginPercentage.toLocaleString() * 100
                  )}
               </span>
            );
         },
         cellClassName: (params) => {
            if (params?.row.highlight) return 'highlight-row';
         },
      },
   ];

   const standardMarginSegments = [
      'C1 1-3.5T - Standard and Premium',
      'C3 - Low Intensity',
      'C4 4-9T - Standard and Premium',
      'C5 4-9T - Standard and Premium',
   ];

   const grossProfitSegments = [
      'C1 4-9T - Standard and Premium',
      'C2 - Standard and Premium',
      'C3 - Standard and Premium',
      'C5 4-9T - Low Intensity',
      'Big Forklift Trucks 10-16T',
      'Port Equipment - Empty Container Handlers',
   ];

   const chartScales = {
      y: {
         title: {
            text:
               grossProfitSegments.find((item) => item == dataFilter.segment?.value) != undefined
                  ? t('volumeDiscount.grossProfit')
                  : t('volumeDiscount.standardMargin'),
            display: true,
         },
      },
      x: {
         title: {
            text: t('volumeDiscount.volume'),
            display: true,
         },
      },
   };

   return (
      <>
         <AppLayout entity="volume-discount">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppNumberField
                     value={
                        dataFilter.pricePerUnit?.value == '' ? '' : dataFilter.pricePerUnit?.value
                     }
                     onChange={(e) => handleChangeDataFilter(e.value, 'pricePerUnit')}
                     name="pricePerUnittt"
                     label={t('filters.dealerNet')}
                     placeholder={t('filters.dealerNet')}
                     prefix="$"
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppNumberField
                     value={
                        dataFilter.costOfGoodSold?.value == ''
                           ? ''
                           : dataFilter.costOfGoodSold?.value
                     }
                     onChange={(e) => handleChangeDataFilter(e.value, 'costOfGoodSold')}
                     name="costOfGoodSold"
                     label={t('filters.costOfGoodSold')}
                     placeholder={t('filters.costOfGoodSold')}
                     prefix="$"
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppNumberField
                     value={
                        ((dataFilter.pricePerUnit?.value - dataFilter.costOfGoodSold?.value) *
                           100) /
                        dataFilter.pricePerUnit?.value
                     }
                     onChange={() => {}}
                     name="marginPerUnit"
                     label={t('filters.marginPercentagePerUnit')}
                     placeholder={t('filters.marginPerUnit')}
                     suffix="%"
                     disabled
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={dataFilter.discountPercentage?.value}
                     onChange={(e) => handleChangeDataFilter(e.value, 'discountPercentage')}
                     name="discountPercentage"
                     label={t('filters.discountPercentagePerOneNewItem')}
                     placeholder={t('filters.discountPercentagePerOneNewItem')}
                     suffix="%"
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppNumberField
                     value={dataFilter.lever?.value}
                     onChange={(e) => handleChangeDataFilter(e.value, 'lever')}
                     name="lever"
                     label={t('filters.unitIncreaseLever')}
                     placeholder={t('filters.unitIncreaseLever')}
                     decimalScale={0}
                     isDecimalScale
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={{ value: dataFilter.segment?.value }}
                     options={initDataFilter.segments}
                     label={t('filters.segment')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option.value, 'segment')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppNumberField
                     value={dataFilter.expectedUnitSales?.value}
                     onChange={(e) => handleChangeDataFilter(e.value, 'expectedUnitSales')}
                     name="expectedUnitSales"
                     label={t('volumeDiscount.expectedUnitSales')}
                     placeholder={t('volumeDiscount.expectedUnitSales')}
                     decimalScale={0}
                     isDecimalScale
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppNumberField
                     value={dataFilter.ocos?.value}
                     onChange={(e) => handleChangeDataFilter(e.value, 'ocos')}
                     name="ocos"
                     label={t('volumeDiscount.ocos')}
                     placeholder={t('volumeDiscount.ocos')}
                     prefix="$"
                  />
               </Grid>

               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleCalculateVolumeDiscount}
                     sx={{ width: '120%', height: 24 }}
                  >
                     {t('button.calculateData')}
                  </Button>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilterTable}
                     sx={{ width: '120%', marginLeft: 3, height: 24 }}
                  >
                     {t('button.clearCalculators')}
                  </Button>
               </Grid>
            </Grid>

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container sx={{ height: '48vh', minHeight: '200px' }}>
                  <AppDataTable
                     sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                           textOverflow: 'clip',
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     entity={'volume-discount-analysis'}
                     currency="USD"
                     dataFilter={{
                        pricePerUnit: dataFilter.pricePerUnit?.value,
                        costOfGoodSold: dataFilter.costOfGoodSold?.value,
                        discountPercentage: dataFilter.discountPercentage?.value / 100,
                        lever: dataFilter.lever?.value,
                        expectedUnitSales: dataFilter.expectedUnitSales?.value,
                        ocos: dataFilter.ocos?.value,
                     }}
                     columnHeaderHeight={70}
                     hideFooter
                     disableColumnMenu
                     rowHeight={35}
                     rows={volumeDiscountData}
                     rowBufferPx={35}
                     columns={columns}
                     getRowId={(params) => params.id}
                  />
                  {/*<DataGridPro
                     sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                           textOverflow: 'clip',
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     columnHeaderHeight={70}
                     hideFooter
                     disableColumnMenu
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rowHeight={35}
                     rows={volumeDiscountData}
                     rowBufferPx={35}
                     columns={columns}
                     getRowId={(params) => params.id}
                  />*/}
               </Grid>

               <AppBackDrop open={loading} hightHeaderTable={'100px'} />
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
                  xs={9}
                  sx={{
                     height: '55vh',
                     width: 'fit-content',
                     position: 'relative',
                  }}
               >
                  <LineChart
                     chartData={chartData}
                     chartName={dataFilter.segment?.value}
                     scales={chartScales}
                     tooltip={tooltip}
                  />
                  <AppBackDrop open={loading} hightHeaderTable={'35px'} bottom={'0px'} />
               </Grid>
            </Grid>
         </AppLayout>
      </>
   );
}
