import { useCallback, useContext, useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage, formatDate } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { bookingStore, commonStore, importFailureStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import moment from 'moment-timezone';

import { destroyCookie, parseCookies, setCookie } from 'nookies';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
   Backdrop,
   Button,
   CircularProgress,
   FormControlLabel,
   ListItem,
   Radio,
   RadioGroup,
   Typography,
} from '@mui/material';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppTextField,
   DataTablePagination,
} from '@/components';

import _ from 'lodash';
import { produce } from 'immer';

import { defaultValueFilterOrder } from '@/utils/defaultValues';
import { DataGridPro, GridCellParams, GridToolbar } from '@mui/x-data-grid-pro';

import ClearIcon from '@mui/icons-material/Clear';
import React from 'react';
import { When } from 'react-if';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import bookingApi from '@/api/booking.api';

import { GetServerSidePropsContext } from 'next';
import { convertCurrencyOfDataBookingOrder } from '@/utils/convertCurrency';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import AppBackDrop from '@/components/App/BackDrop';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { paperStyle } from '@/theme/paperStyle';
import { useTranslation } from 'react-i18next';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { extractTextInParentheses } from '@/utils/getString';

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
   const listExchangeRate = useSelector(bookingStore.selectExchangeRateList);
   const serverTimeZone = useSelector(bookingStore.selectServerTimeZone);
   const serverLatestUpdatedTime = useSelector(bookingStore.selectLatestUpdatedTime);

   const [loading, setLoading] = useState(false);

   const [loadingTable, setLoadingTable] = useState(false);

   const [uploadedFile, setUploadedFile] = useState<FileChoosed[]>([]);

   const [listOrder, setListOrder] = useState(listBookingOrder);

   const [totalRow, setTotalRow] = useState(listTotalRow);

   const [currency, setCurrency] = useState('USD');

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const appendFileIntoList = (file) => {
      setUploadedFile((prevFiles) => [...prevFiles, file]);
   };

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
      setLoadingTable(true);
      dispatch(bookingStore.actions.setDefaultValueFilterBooking(dataFilter));
      handleChangePage(1);
   };

   useEffect(() => {
      setLoadingTable(false);
   }, [listOrder]);

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
         flex: 0.4,
         headerName: t('table.order#'),
      },
      {
         field: 'quoteNumber',
         flex: 0.6,
         headerName: t('table.quoteNumber'),
      },
      {
         field: 'date',
         flex: 0.5,
         headerName: t('table.createAt'),
         renderCell(params) {
            return <span>{formatDate(params?.row?.date)}</span>;
         },
      },
      {
         field: 'region',
         flex: 0.5,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.country?.region?.regionName}</span>;
         },
      },
      {
         field: 'ctryCode',
         flex: 0.6,
         headerName: t('table.country'),
         renderCell(params) {
            return <span>{params.row.country?.countryName}</span>;
         },
      },
      {
         field: 'dealerName',
         flex: 1.2,
         headerName: t('table.dealerName'),
         renderCell(params) {
            return <span>{params.row.dealer?.name}</span>;
         },
      },
      {
         field: 'Plant',
         flex: 0.6,
         headerName: t('table.plant'),
         renderCell(params) {
            return <span>{params.row.product?.plant}</span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.product?.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.4,
         headerName: t('table.series'),
         renderCell(params) {
            return <span>{params.row.series}</span>;
         },
      },
      {
         field: 'model',
         flex: 0.6,
         headerName: t('table.models'),
         renderCell(params) {
            return <span style={{ cursor: 'pointer' }}>{params.row.product.modelCode}</span>;
         },
      },
      {
         field: 'quantity',
         flex: 0.3,
         headerName: t('table.qty'),
         ...formatNumbericColumn,
      },

      {
         field: 'dealerNet',
         flex: 0.8,
         headerName: `${t('table.dealerNet')} ('000 ${currency})`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNet)}</span>;
         },
      },
      {
         field: 'dealerNetAfterSurcharge',
         flex: 0.8,
         headerName: `${t('table.dealerNetAfterSurcharge')} ('000 ${currency})`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNetAfterSurcharge)}</span>;
         },
      },
      {
         field: 'totalCost',
         flex: 0.8,
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
         headerName: `${t('table.marginAfterSurcharge')} ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.marginAfterSurcharge)}</span>;
         },
      },
      {
         field: 'marginPercentageAfterSurcharge',
         flex: 0.6,
         headerName: t('table.marginPercentageAfterSurcharge'),
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
      heightComponentExcludingTable = 330;
   }

   const handleUploadFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);

      bookingApi
         .importDataBooking(formData)
         .then((response) => {
            setLoading(false);
            handleWhenImportSuccessfully(response);
         })
         .catch((error) => {
            // stop spiner
            setLoading(false);
            //show message
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
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

   const handleImport = () => {
      if (uploadedFile.length > 0) {
         // resert message
         setLoading(true);
         handleUploadFile(uploadedFile[0]);
      } else {
         dispatch(commonStore.actions.setErrorMessage('No file choosed'));
      }
   };

   const handleRemove = (fileName) => {
      const updateUploaded = uploadedFile.filter((file) => file.name != fileName);
      setUploadedFile(updateUploaded);
   };

   // ======= CONVERT CURRENCY ========

   const handleChange = (event) => {
      setCurrency(event.target.value);
   };

   useEffect(() => {
      setUserRoleState(userRole);

      setListOrder(listBookingOrder);
      setTotalRow(listTotalRow);

      setListOrder((prev) => {
         return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      });

      setTotalRow((prev) => {
         return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      });
      convertTimezone();
   }, [listBookingOrder, listTotalRow, currency, serverTimeZone, serverLatestUpdatedTime]);

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

   return (
      <>
         <AppLayout entity="booking">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.dealerNet')} ('000 {currency})
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(totalRow[0]?.dealerNet)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.dealerNetAfterSurcharge')} ('000 {currency})
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(totalRow[0]?.dealerNetAfterSurcharge)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={3}>
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
               <Grid item xs={3}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.marginPercentageAfterSurcharge')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(
                              totalRow[0]?.marginPercentageAfterSurcharge * 100
                           )}
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
                        focused
                     />
                  </Grid>
               </Grid>
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.dealers, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.dealers}
                     label={t('filters.dealerName')}
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

               <Grid item>
                  <RadioGroup
                     row
                     value={currency}
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
                        value="USD"
                        control={<Radio />}
                        label="USD"
                     />
                     <FormControlLabel
                        sx={{
                           height: '80%',
                        }}
                        value="AUD"
                        control={<Radio />}
                        label="AUD"
                     />
                  </RadioGroup>
               </Grid>
            </Grid>

            <When condition={userRoleState === 'ADMIN'}>
               <Grid container spacing={1} sx={{ marginTop: '3px' }}>
                  <Grid item xs={1}>
                     <UploadFileDropZone
                        uploadedFile={uploadedFile}
                        setUploadedFile={appendFileIntoList}
                        handleUploadFile={handleUploadFile}
                     />
                  </Grid>
                  <Grid item xs={1}>
                     <Button
                        variant="contained"
                        onClick={handleImport}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.import')}
                     </Button>
                  </Grid>

                  <Grid item xs={4} sx={{ display: 'flex' }}>
                     {uploadedFile &&
                        uploadedFile.map((file) => (
                           <ListItem
                              sx={{
                                 padding: 0,
                                 backgroundColor: '#e3e3e3',
                                 width: '75%',
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 paddingLeft: '10px',
                                 borderRadius: '3px',
                                 marginLeft: '4px',
                                 height: '26px',
                              }}
                           >
                              <span
                                 style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                 }}
                              >
                                 {file.name}
                              </span>
                              <Button
                                 onClick={() => handleRemove(file.name)}
                                 sx={{ width: '20px' }}
                              >
                                 <ClearIcon />
                              </Button>
                           </ListItem>
                        ))}
                  </Grid>
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
                     columnHeaderHeight={60}
                     rowHeight={30}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rows={listOrder}
                     rowBuffer={35}
                     rowThreshold={25}
                     columns={columns}
                     getRowId={(params) => params.orderNo}
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

function UploadFileDropZone(props) {
   const { t } = useTranslation();
   const onDrop = useCallback(
      (acceptedFiles) => {
         acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
               if (props.uploadedFile.length + acceptedFiles.length > 1) {
                  dispatch(commonStore.actions.setErrorMessage('Too many files'));
               } else {
                  props.setUploadedFile(file);
               }
            };
            reader.readAsArrayBuffer(file);
         });
      },
      [props.uploadedFile, props.setUploadedFile]
   );

   const { getRootProps, getInputProps, open, fileRejections } = useDropzone({
      noClick: true,
      onDrop,
      maxSize: 10485760, // < 10MB
      maxFiles: 1,
      accept: {
         'excel/xlsx': ['.xlsx'],
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
         <Button
            type="button"
            onClick={open}
            variant="contained"
            sx={{ width: '100%', height: 24 }}
         >
            {t('button.selectFile')}
         </Button>
      </div>
   );
}
