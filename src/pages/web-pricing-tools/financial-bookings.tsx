import { useContext, useEffect, useState } from 'react';

import { bookingStore, commonStore, importFailureStore } from '@/store/reducers';
import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatDate, formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';

import { setCookie } from 'nookies';

import { Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppTextField,
   DataTablePagination,
} from '@/components';

import { produce } from 'immer';
import _ from 'lodash';

import { defaultValueFilterOrder } from '@/utils/defaultValues';

import bookingApi from '@/api/booking.api';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { When } from 'react-if';

import aopmarginApi from '@/api/aopMargin.api';
import AppBackDrop from '@/components/App/BackDrop';
import AppDataTable from '@/components/DataTable/AppDataGridPro';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { paperStyle } from '@/theme/paperStyle';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { extractTextInParentheses } from '@/utils/getString';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { BOOKING } from '@/utils/modelType';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';

import { UploadFileDropZone } from '@/components/App/UploadFileDropZone';
import GetAppIcon from '@mui/icons-material/GetApp';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

interface FileChoosed {
   name: string;
}

export default function Booking() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   const listBookingOrder = useSelector(bookingStore.selectBookingList);
   const listTotalRow = useSelector(bookingStore.selectTotalRow);
   const initDataFilter = useSelector(bookingStore.selectInitDataFilter);
   const cacheDataFilter = useSelector(bookingStore.selectDataFilter);

   const serverTimeZone = useSelector(bookingStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(bookingStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(bookingStore.selectLastUpdatedBy);
   const currency = useSelector(bookingStore.selectCurrency);

   const loadingTable = useSelector(bookingStore.selectLoadingData);
   const exampleFile = useSelector(bookingStore.selectExampleUploadFile);

   const [loading, setLoading] = useState(false);
   // const [listOrder, setListOrder] = useState(listBookingOrder);

   const [totalRow, setTotalRow] = useState(listTotalRow);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);
   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);

   // import failure dialog
   const importFailureDialogDataFilter = useSelector(importFailureStore.selectDataFilter);

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
      if (!hasSetDataFilter && cacheDataFilter) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter !== cacheDataFilter) {
            console.log('hehe, ', dataFilter);
            setCookie(null, 'bookingFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterOrderBooking();
         }
      }, 700);

      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   const handleFilterOrderBooking = () => {
      dispatch(bookingStore.actions.setDefaultValueFilterBooking(dataFilter));
      handleChangePage(1);
   };

   // useEffect(() => {
   //    dispatch(bookingStore.actions.setLoadingData(true));
   // }, [listOrder]);

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(bookingStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const tableState = useSelector(commonStore.selectTableState);

   const columns = [
      {
         field: 'orderNo',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.order#'),
         renderCell(params) {
            return <span>{params?.row?.id?.orderNo}</span>;
         },
      },
      {
         field: 'quoteNumber',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.quoteNumber'),
      },
      {
         field: 'date',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.createAt'),
         renderCell(params) {
            return <span>{formatDate(params?.row?.id?.date)}</span>;
         },
      },
      {
         field: 'region',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.country?.region?.regionName}</span>;
         },
      },
      {
         field: 'ctryCode',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.country'),
         renderCell(params) {
            return <span>{params.row.country?.countryName}</span>;
         },
      },
      {
         field: 'dealerName',
         flex: 0.6,
         minWidth: 150,
         headerName: t('table.dealerName'),
         renderCell(params) {
            return <span>{params.row?.id?.dealer?.name}</span>;
         },
      },
      {
         field: 'Plant',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.plant'),
         renderCell(params) {
            return <span>{params.row.product?.plant}</span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.product?.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.series'),
         renderCell(params) {
            return <span>{params.row.product.series.series}</span>;
         },
      },
      {
         field: 'model',
         flex: 0.3,
         minWidth: 70,
         headerName: t('table.models'),
         renderCell(params) {
            return <span style={{ cursor: 'pointer' }}>{params.row.product.modelCode}</span>;
         },
      },
      {
         field: 'quantity',
         flex: 0.3,
         minWidth: 50,
         headerName: t('table.qty'),
         ...formatNumbericColumn,
      },

      {
         field: 'dealerNet',
         flex: 0.6,
         minWidth: 80,
         headerName: `${t('table.listPrice')} ('000 ${currency})`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNet)}</span>;
         },
      },
      {
         field: 'discountPercentage',
         flex: 0.6,
         minWidth: 80,
         headerName: `${t('table.discount')} (%)`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(
                     (1 -
                        params?.row.dealerNetAfterSurcharge /
                           (params?.row.dealerNet === 0 ? 1 : params?.row.dealerNet)) *
                        100
                  )}
               </span>
            );
         },
      },
      {
         field: 'dealerNetAfterSurcharge',
         flex: 0.5,
         minWidth: 100,
         headerName: `${t('table.dealerNet')} ('000 ${currency})`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNetAfterSurcharge)}</span>;
         },
      },
      {
         field: 'totalCost',
         flex: 0.7,
         minWidth: 80,
         headerName: `${t('table.totalCost')} ('000 ${currency})`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.totalCost)}</span>;
         },
      },
      {
         field: 'marginAfterSurcharge',
         flex: 0.7,
         minWidth: 130,
         headerName: `${t('table.margin')} ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.marginAfterSurcharge)}</span>;
         },
      },
      {
         field: 'marginPercentageAfterSurcharge',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.marginPercentage'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell',
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(params?.row.marginPercentageAfterSurcharge * 100)}
               </span>
            );
         },
      },
      {
         field: 'aopmarginPercentage',
         flex: 0.6,
         minWidth: 120,
         headerName: t('table.aopMarginPercentage'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.aopmargin.marginSTD * 100)}</span>;
         },
      },
   ];

   let heightComponentExcludingTable = 293;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');
   if (userRoleState === 'ADMIN') {
      heightComponentExcludingTable = 355;
   }

   const handleUploadFile = async (file: File, apiMethod: (formData: FormData) => Promise<any>) => {
      let formData = new FormData();
      formData.append('file', file);
      setLoading(true);

      apiMethod(formData)
         .then((response) => {
            setLoading(false);
            handleWhenImportSuccessfully(response);
         })
         .catch((error) => {
            // stop spinner
            setLoading(false);
            // show message
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleUploadBookedFile = (file: File) => {
      handleUploadFile(file, bookingApi.importBookedFile);
   };

   const handleUploadCostDataFile = (file: File) => {
      handleUploadFile(file, bookingApi.importCostDataFile);
   };

   const handleUploadAOPMarginFile = (file: File) => {
      handleUploadFile(file, aopmarginApi.importDataAOPMargin);
   };

   const handleWhenImportSuccessfully = (res) => {
      //show message
      dispatch(commonStore.actions.setSuccessMessage(res.data.message));
      // update importFailureState, prepare to open dialog
      dispatch(
         importFailureStore.actions.setDataFilter({
            ...importFailureDialogDataFilter,
            fileUUID: res.data.data,
         })
      );
      dispatch(
         importFailureStore.actions.setImportFailureDialogState({
            overview: extractTextInParentheses(res.data.message),
         })
      );
      //refresh data table and paging
      dispatch(bookingStore.sagaGetList());
   };

   useEffect(() => {
      setUserRoleState(userRole);

      // setListOrder(listBookingOrder);
      setTotalRow(listTotalRow);

      convertTimezone();
   }, [listBookingOrder, listTotalRow, currency, serverTimeZone, serverLastUpdatedTime]);

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

   // console.log(dataFilter.AOPMarginPercentageGroup);

   const handleCloseImageDialog = () => {
      setImageDialogState({
         open: false,
         imageUrl: undefined,
      });
   };

   // handle prevent open ProductDetail Dialog when click button edit
   const handleOnCellClick = (params, event) => {
      // console.log(params.row.product?.modelCode);
      // console.log(params.id);
      if (params.field === 'model') {
         event.stopPropagation();
         setProductDetailState({
            open: true,
            model: params.row.product?.modelCode,
            _series: params.row?.product?.series,
            orderNo: params.id,
         });
      }
   };

   // show latest updated time
   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setDataFilter(defaultValueFilterOrder);
   };

   return (
      <>
         <AppLayout entity="booking">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.listPrice')} ('000 {currency})
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(totalRow[0]?.dealerNet)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.dealerNet')} ('000 {currency})
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(totalRow[0]?.dealerNetAfterSurcharge)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.totalCost')} ('000 {currency})
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(totalRow[0]?.totalCost)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.marginPercentage')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(
                              totalRow[0]?.marginPercentageAfterSurcharge * 100
                           )}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.totalQuantity')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {totalRow[0]?.quantity || 0}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
            </Grid>

            <Grid container spacing={1}>
               <Grid item xs={4}>
                  <Grid item xs={12}>
                     <AppTextField
                        value={dataFilter.orderNo}
                        onChange={(e) => handleChangeDataFilter(e.target.value, 'orderNo')}
                        name="orderNo"
                        label={t('filters.order#')}
                        placeholder={t('filters.searchOrderById')}
                        isTrim
                        focused
                     />
                  </Grid>
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     sx={{ zIndex: 20, height: 25, position: 'relative' }}
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25, position: 'relative' }}>
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
               <Grid item xs={2} sx={{ height: 25, zIndex: 10, position: 'relative' }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.metaSeries, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.metaSeries}
                     label={t('filters.metaSeries')}
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25, position: 'relative' }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.dealers, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.dealers}
                     label={t('filters.dealerName')}
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
               <Grid item xs={2} sx={{ height: 25, zIndex: 10, position: 'relative' }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.classes, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.classes}
                     label={t('filters.class')}
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
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
                     value={_.map(dataFilter.segments, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.segments}
                     label={t('filters.segment')}
                     sx={{ zIndex: 10, height: 25, position: 'relative' }}
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
               <Grid item xs={2}>
                  <AppAutocomplete
                     value={
                        dataFilter.aopMarginPercentageGroup !== undefined
                           ? {
                                value: `${dataFilter.aopMarginPercentageGroup}`,
                             }
                           : { value: '' }
                     }
                     options={initDataFilter.AOPMarginPercentageGroup}
                     label={t('filters.aopMarginPercentage')}
                     primaryKeyOption="value"
                     onChange={(e, option) =>
                        handleChangeDataFilter(
                           _.isNil(option) ? '' : option?.value,
                           'aopMarginPercentageGroup'
                        )
                     }
                     disableClearable={false}
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={4}>
                  <Grid item xs={6} sx={{ paddingRight: 0.5 }}>
                     <AppAutocomplete
                        value={
                           dataFilter.marginPercentage !== undefined
                              ? {
                                   value: `${dataFilter.marginPercentage}`,
                                }
                              : { value: '' }
                        }
                        options={initDataFilter.marginPercentageGroup}
                        label={t('filters.marginPercentage')}
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
               </Grid>
               <Grid item xs={2}>
                  <AppDateField
                     views={['day', 'month', 'year']}
                     label={t('filters.fromDate')}
                     name="from_date"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'fromDate')
                     }
                     value={dataFilter?.fromDate}
                     maxDate={new Date().toISOString().slice(0, 10)}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppDateField
                     views={['day', 'month', 'year']}
                     label={t('filters.toDate')}
                     name="toDate"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'toDate')
                     }
                     value={dataFilter?.toDate}
                     maxDate={new Date().toISOString().slice(0, 10)}
                  />
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleFilterOrderBooking}
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

            <When condition={userRoleState === 'ADMIN'}>
               <Grid container spacing={1} sx={{ marginTop: '3px', alignItems: 'end' }}>
                  <Grid item xs={2}>
                     <UploadFileDropZone
                        handleUploadFile={handleUploadBookedFile}
                        buttonName="button.bookedFile"
                     />
                  </Grid>
                  <Grid item xs={2}>
                     <UploadFileDropZone
                        handleUploadFile={handleUploadCostDataFile}
                        buttonName="button.costDataFile"
                     />
                  </Grid>
                  <Grid item xs={2}>
                     <UploadFileDropZone
                        handleUploadFile={handleUploadAOPMarginFile}
                        buttonName="button.aopMargin"
                     />
                  </Grid>
                  <Typography
                     sx={{
                        color: 'blue',
                        fontSize: 5,
                        margin: '0 30px 0 10px',
                        cursor: 'pointer',
                     }}
                     onClick={() => downloadFileByURL(exampleFile[BOOKING])}
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
               </Grid>
            </When>

            <Paper
               elevation={1}
               sx={{
                  marginTop: 2,
                  position: 'relative',
                  '& .highlight-cell': {
                     backgroundColor: '#e7a800',
                  },
               }}
            >
               <Grid container sx={{ height: `calc(100vh - ${heightComponentExcludingTable}px)` }}>
                  <AppDataTable
                     columnHeaderHeight={90}
                     dataFilter={dataFilter}
                     currency={currency}
                     entity={'booking'}
                     rows={listBookingOrder}
                     columns={columns}
                     getRowId={(params) => params.id.orderNo + params.id.date + params.id.dealer}
                     onCellClick={handleOnCellClick}
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
               <AppBackDrop open={loadingTable} hightHeaderTable={'93px'} />
            </Paper>
         </AppLayout>
         <ProductDetailDialog
            {...productDetailState}
            handleOpenImageDialog={handleOpenImageDialog}
            onClose={handleCloseProductDetail}
         />
         <ShowImageDialog />
         <AppBackDrop open={loading} hightHeaderTable={60} bottom={1} />
         <LogImportFailureDialog />
      </>
   );
}
