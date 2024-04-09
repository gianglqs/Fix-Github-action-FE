import { useCallback, useContext, useEffect, useState, useTransition } from 'react';

import { centerHeaderColumn, formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage, formatDate } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { priceVolumeSensitivityStore, commonStore, importFailureStore } from '@/store/reducers';
import moment from 'moment-timezone';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
   Backdrop,
   Button,
   CircularProgress,
   FormControlLabel,
   Radio,
   RadioGroup,
   Typography,
} from '@mui/material';
import { setCookie } from 'nookies';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppNumberField,
   AppTextField,
   DataTablePagination,
} from '@/components';

import _ from 'lodash';
import { produce } from 'immer';

import { defaultValueFilterOrder } from '@/utils/defaultValues';
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { convertCurrencyOfDataBookingOrder } from '@/utils/convertCurrency';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import AppBackDrop from '@/components/App/BackDrop';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { useTranslation } from 'react-i18next';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function PriceVolumeSensitivity() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   const listPriceVolumeSensitivity = useSelector(
      priceVolumeSensitivityStore.selectPriceVolumeSensitivityList
   );

   const initDataFilter = useSelector(priceVolumeSensitivityStore.selectInitDataFilter);

   const cacheDataFilter = useSelector(priceVolumeSensitivityStore.selectDataFilter);

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const [listOrder, setListOrder] = useState(listPriceVolumeSensitivity);

   const serverTimeZone = useSelector(priceVolumeSensitivityStore.selectServerTimeZone);
   const serverLatestUpdatedTime = useSelector(priceVolumeSensitivityStore.selectLatestUpdatedTime);

   const [withMarginVolumeRecovery, setWithMarginVolumeRecovery] = useState(true);
   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');
   const listExchangeRate = useSelector(priceVolumeSensitivityStore.selectExchangeRateList);

   const cacheDiscountPercent = useSelector(priceVolumeSensitivityStore.selectDiscountPercent);
   const [discountPercent, setDiscountPercent] = useState(cacheDiscountPercent);
   const [showColumnSeries, setShowColumnSeries] = useState(false);

   //  const [uploadedFile, setUploadedFile] = useState({ name: '' });
   // use importing to control spiner
   const [loading, setLoading] = useState(false);
   const [loadingTable, setLoadingTable] = useState(false);
   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);
   const [hasSetDiscountPercent, setHasSetDiscountPercent] = useState(false);

   // import failure dialog

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (
               _.includes(
                  ['orderNo', 'fromDate', 'toDate', 'marginPercentage', 'aopMarginPercentageGroup'],
                  field
               )
            ) {
               draft[field] = option;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   useEffect(() => {
      if (!hasSetDiscountPercent) {
         setDiscountPercent(cacheDiscountPercent);

         setHasSetDiscountPercent(true);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      if (!hasSetDataFilter && Object.keys(cacheDataFilter).length != 0) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   });

   useEffect(() => {
      const debouncedHandleWhenChangeDiscountPercent = _.debounce(() => {
         setCookie(null, 'priceVolumnSensitivityDiscountPercent', discountPercent.toString(), {
            maxAge: 604800,
            path: '/',
         });
         handleCalculator();
      }, 500);

      debouncedHandleWhenChangeDiscountPercent();
      return () => debouncedHandleWhenChangeDiscountPercent.cancel();
   }, [discountPercent]);

   const handleCalculator = () => {
      setLoadingTable(true);
      dispatch(priceVolumeSensitivityStore.actions.setDiscountPercent(discountPercent));
      handleChangePage(1);
   };

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            setCookie(null, 'priceVolumnSensitivityFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterOrder();
            checkShowSeriesColumn();
         }
      }, 500);

      debouncedHandleWhenChangeDataFilter();
      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   const handleFilterOrder = () => {
      setLoadingTable(true);
      dispatch(priceVolumeSensitivityStore.actions.setDefaultValueFilterOrder(dataFilter));
      handleChangePage(1);
   };

   useEffect(() => {
      setLoadingTable(false);
   }, [listPriceVolumeSensitivity]);

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(priceVolumeSensitivityStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const tableState = useSelector(commonStore.selectTableState);

   const columns = [
      {
         field: 'segment',
         flex: 0.6,
         ...centerHeaderColumn,
         headerName: t('table.segment'),
      },
      {
         field: 'series',
         flex: 0.2,
         ...centerHeaderColumn,
         headerName: `${t('table.series')}`,

         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.series}</span>;
         },
      },

      {
         field: 'volume',
         flex: 0.2,
         ...centerHeaderColumn,
         headerName: `${t('table.volume')}`,
         ...formatNumbericColumn,
      },

      {
         field: 'revenue',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.revenue')} ('000$)`,

         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.revenue)}</span>;
         },
      },
      {
         field: 'cogs',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.COGS')} ('000$)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.cogs)}</span>;
         },
      },
      {
         field: 'margin',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.margin')} ('000$)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.margin)}</span>;
         },
      },
      {
         field: 'margin%',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.margin%')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.marginPercent * 100)}</span>;
         },
      },
      {
         field: 'discount',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.discount')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.discountPercent * 100)}</span>;
         },
      },
      {
         field: 'newDealerNet(ASP)',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newDealerNetASP')} $`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newDN * 100)}</span>;
         },
      },
      {
         field: 'unitVolumeOffset',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.unitVolumeOffset')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.unitVolumeOffset}</span>;
         },
      },
      {
         field: 'newVolume',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.newVolume')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.newVolume}</span>;
         },
      },
      {
         field: 'newRevenue',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newRevenue')} ('000$)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newRevenue)}</span>;
         },
      },
      {
         field: 'newCOGS',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newCOGS')} ('000$)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newCOGS)}</span>;
         },
      },
      {
         field: 'newMargin',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newMargin')} ('000$)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newMargin)}</span>;
         },
      },
      {
         field: 'newMargin%',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newMargin%')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.newMarginPercent * 100)}</span>;
         },
      },
   ];

   const columnsWithoutSeries = [
      {
         field: 'segment',
         flex: 0.6,
         ...centerHeaderColumn,
         headerName: t('table.segment'),
      },

      {
         field: 'volume',
         flex: 0.3,
         ...centerHeaderColumn,
         headerName: `${t('table.volume')}`,
         ...formatNumbericColumn,
      },

      {
         field: 'revenue',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.revenue')} ('000$)`,

         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.revenue)}</span>;
         },
      },
      {
         field: 'cogs',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.COGS')} ('000$)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.cogs)}</span>;
         },
      },
      {
         field: 'margin',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.margin')} ('000$)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.margin)}</span>;
         },
      },
      {
         field: 'margin%',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.margin%')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.marginPercent * 100)}</span>;
         },
      },
      {
         field: 'discount',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.discount')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.discountPercent * 100)}</span>;
         },
      },
      {
         field: 'newDealerNet(ASP)',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newDealerNetASP')} $`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newDN * 100)}</span>;
         },
      },
      {
         field: 'unitVolumeOffset',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.unitVolumeOffset')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.unitVolumeOffset}</span>;
         },
      },
      {
         field: 'newVolume',
         flex: 0.3,
         headerName: `${t('priceVolumeSensitivity.newVolume')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.newVolume}</span>;
         },
      },
      {
         field: 'newRevenue',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newRevenue')} ('000$)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newRevenue)}</span>;
         },
      },
      {
         field: 'newCOGS',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newCOGS')} ('000$)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newCOGS)}</span>;
         },
      },
      {
         field: 'newMargin',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newMargin')} ('000$)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newMargin)}</span>;
         },
      },
      {
         field: 'newMargin%',
         flex: 0.4,
         headerName: `${t('priceVolumeSensitivity.newMargin%')}`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.newMarginPercent * 100)}</span>;
         },
      },
   ];

   let heightComponentExcludingTable = 185;

   // ======= CONVERT CURRENCY ========

   const handleChange = (event) => {
      setWithMarginVolumeRecovery(event.target.value);
   };

   useEffect(() => {
      setListOrder(listPriceVolumeSensitivity);

      // setListOrder((prev) => {
      //    return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      // });

      // setTotalRow((prev) => {
      //    return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      // });
      convertTimezone();
   }, [listPriceVolumeSensitivity]);

   // ===== show Product detail =======
   const [productDetailState, setProductDetailState] = useState({
      open: false,
      model: null,
      _series: null,
      orderNo: null,
   });

   const handleCloseProductDetail = () => {
      setProductDetailState({
         open: false,
         model: null,
         _series: null,
         orderNo: null,
      });
   };

   // ===== show Image ======/
   const [imageDialogState, setImageDialogState] = useState({
      open: false,
      imageUrl: null,
   });

   const handleOpenImageDialog = (imageUrl) => {
      setImageDialogState({
         open: true,
         imageUrl: imageUrl,
      });
   };

   const handleCloseImageDialog = () => {
      setImageDialogState({
         open: false,
         imageUrl: undefined,
      });
   };

   // handle prevent open ProductDetail Dialog when click button edit
   const handleOnCellClick = (params, event) => {
      if (params.field === 'model') {
         event.stopPropagation();
         setProductDetailState({
            open: true,
            model: params.row.product?.modelCode,
            _series: params.row?.series,
            orderNo: params.id,
         });
      }
   };

   // show latest updated time
   const convertTimezone = () => {
      if (serverLatestUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLatestUpdatedTime, serverTimeZone)
         );
      }
   };

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setDataFilter(defaultValueFilterOrder);
   };

   useEffect(() => {
      setLoadingTable(true);
      dispatch(
         priceVolumeSensitivityStore.actions.setWithMarginVolumeRecovery(withMarginVolumeRecovery)
      );
      dispatch(priceVolumeSensitivityStore.sagaGetList());
   }, [withMarginVolumeRecovery]);

   // check Condition to view column Series
   const checkShowSeriesColumn = () => {
      if (dataFilter?.metaSeries?.length !== 0) {
         setShowColumnSeries(true);
         console.log('chon series');
      } else {
         if (dataFilter?.segments?.length === 1) {
            setShowColumnSeries(true);
            console.log('1 segment');
         } else {
            setShowColumnSeries(false);
            console.log('nhieu segment');
         }
      }
   };

   return (
      <>
         <AppLayout entity="priceVolumeSensitivity">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.segments, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.segments}
                     label={t('filters.segment')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'segments')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={1.5}>
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

               <Grid item xs={1.5}>
                  <AppDateField
                     views={['day', 'month', 'year']}
                     label={t('filters.fromDate')}
                     name="from_date"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'fromDate')
                     }
                     value={dataFilter?.fromDate}
                  />
               </Grid>
               <Grid item xs={1.5}>
                  <AppDateField
                     views={['day', 'month', 'year']}
                     label={t('filters.toDate')}
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
                     onClick={handleFilterOrder}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.filter')}
                  </Button>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilters}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.clear')}
                  </Button>
               </Grid>
            </Grid>
            <Grid container spacing={1} marginTop={1}>
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppNumberField
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(Number(e.value))}
                        name="costAdjPercentage"
                        label={`${t('priceVolumeSensitivity.discount')}`}
                        placeholder="Cost Adj %"
                        suffix="%"
                     />
                  </Grid>
               </Grid>
               <Grid item>
                  <RadioGroup
                     row
                     value={withMarginVolumeRecovery}
                     onChange={handleChange}
                     aria-labelledby="demo-row-radio-buttons-group-label"
                     name="row-radio-buttons-group"
                     sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginLeft: 1,
                        height: '90%',
                     }}
                  >
                     <FormControlLabel
                        sx={{
                           height: '80%',
                        }}
                        value={true}
                        control={<Radio />}
                        label={t('priceVolumeSensitivity.withMarginVolumeRecovery')}
                     />
                     <FormControlLabel
                        sx={{
                           height: '80%',
                        }}
                        value={false}
                        control={<Radio />}
                        label={t('priceVolumeSensitivity.withoutMarginVolumeRecovery')}
                     />
                  </RadioGroup>
               </Grid>
            </Grid>

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container sx={{ height: `calc(95vh - ${heightComponentExcludingTable}px)` }}>
                  <DataGridPro
                     hideFooter
                     disableColumnMenu
                     sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     columnHeaderHeight={70}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rowHeight={30}
                     rows={listOrder}
                     rowBuffer={35}
                     rowThreshold={25}
                     columns={showColumnSeries ? columns : columnsWithoutSeries}
                     getRowId={(params) => params.id}
                     onCellClick={handleOnCellClick}
                  />
               </Grid>
               <DataTablePagination
                  page={tableState.pageNo}
                  perPage={tableState.perPage}
                  totalItems={tableState.totalItems}
                  onChangePage={handleChangePage}
                  onChangePerPage={handleChangePerPage}
                  lastUpdated={clientLatestUpdatedTime}
               />
               <AppBackDrop open={loadingTable} hightHeaderTable={'93px'} />
            </Paper>
         </AppLayout>
         <ProductDetailDialog
            {...productDetailState}
            handleOpenImageDialog={handleOpenImageDialog}
            onClose={handleCloseProductDetail}
         />
         <ShowImageDialog {...imageDialogState} onClose={handleCloseImageDialog} />
         <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
         >
            <CircularProgress color="inherit" />
         </Backdrop>

         <LogImportFailureDialog />
      </>
   );
}
