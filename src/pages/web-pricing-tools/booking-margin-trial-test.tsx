import { useCallback, useContext, useEffect, useState } from 'react';

import { bookingMarginTrialTestStore, commonStore, importFailureStore } from '@/store/reducers';
import { centerColumn, centerHeaderColumn, formatNumbericColumn } from '@/utils/columnProperties';
import { formatDate, formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';

import ClearIcon from '@mui/icons-material/Clear';
import { Backdrop, Button, CircularProgress, ListItem, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { setCookie } from 'nookies';
import { useDropzone } from 'react-dropzone';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppTextField,
   DataTablePagination,
} from '@/components';

import { produce } from 'immer';
import _ from 'lodash';

import bookingMarginTrialTestApi from '@/api/bookingMarginTrialTest.api';
import AppBackDrop from '@/components/App/BackDrop';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { convertCurrencyOfDataBookingOrder } from '@/utils/convertCurrency';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { defaultValueFilterOrder } from '@/utils/defaultValues';
import { extractTextInParentheses } from '@/utils/getString';
import { styled } from '@mui/material/styles';
import {
   DataGridPro,
   GridColDef,
   GridColumnGroupHeaderParams,
   GridColumnGroupingModel,
   GridToolbar,
} from '@mui/x-data-grid-pro';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';
import { componentType } from '@/theme/paperStyle';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { BOOKING_FPA } from '@/utils/modelType';
import GetAppIcon from '@mui/icons-material/GetApp';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}
interface FileChoosed {
   name: string;
}

const HeaderWithIconRoot = styled('div')(({ theme }) => ({
   overflow: 'hidden',
   display: 'flex',
   alignItems: 'center',
   '& span': {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginRight: theme.spacing(0.5),
   },
}));

interface HeaderWithIconProps extends GridColumnGroupHeaderParams {
   icon: React.ReactNode;
}

function HeaderWithIcon(props: HeaderWithIconProps) {
   const { icon, ...params } = props;

   return (
      <HeaderWithIconRoot>
         <span>{params.headerName ?? params.groupId}</span> {icon}
      </HeaderWithIconRoot>
   );
}

export default function Shipment() {
   const dispatch = useDispatch();

   const { t } = useTranslation();

   const initDataFilter = useSelector(bookingMarginTrialTestStore.selectInitDataFilter);
   const listTotalRow = useSelector(bookingMarginTrialTestStore.selectTotalRow);

   const cacheDataFilter = useSelector(bookingMarginTrialTestStore.selectDataFilter);

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const listShipment = useSelector(bookingMarginTrialTestStore.selectOrderList);

   const [listOrder, setListOrder] = useState(listShipment);

   const [totalRow, setTotalRow] = useState(listTotalRow);

   const serverTimeZone = useSelector(bookingMarginTrialTestStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(bookingMarginTrialTestStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(bookingMarginTrialTestStore.selectLastUpdatedBy);
   const exampleFile = useSelector(bookingMarginTrialTestStore.selectExampleUploadFile);

   const [currency, setCurrency] = useState('USD');
   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');
   const listExchangeRate = useSelector(bookingMarginTrialTestStore.selectExchangeRateList);

   //  const [uploadedFile, setUploadedFile] = useState({ name: '' });
   const [uploadedFile, setUploadedFile] = useState<FileChoosed[]>([]);
   // use importing to control spiner
   const [loading, setLoading] = useState(false);
   const loadingTable = useSelector(bookingMarginTrialTestStore.selectLoadingData);
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
      if (!hasSetDataFilter && Object.keys(cacheDataFilter).length != 0) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            console.log('hehe, ', dataFilter);
            setCookie(null, 'bookingMarginTrialTestFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterOrderShipment();
         }
      }, 500);

      debouncedHandleWhenChangeDataFilter();
      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   const handleFilterOrderShipment = () => {
      dispatch(bookingMarginTrialTestStore.actions.setDefaultValueFilterOrder(dataFilter));
      handleChangePage(1);
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(bookingMarginTrialTestStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const tableState = useSelector(commonStore.selectTableState);

   const columns: GridColDef[] = [
      {
         field: 'orderNo',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.order#'),
         renderCell(params) {
            return <span>{params.row.booking.orderNo}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.series'),
         renderCell(params) {
            return <span>{params.row.booking.series.series}</span>;
         },
      },
      {
         field: 'Plant',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.plant'),
         renderCell(params) {
            return <span>{params.row.booking.product?.plant}</span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.booking.product?.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'ctryCode',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.country'),
         renderCell(params) {
            return <span>{params.row.booking.country?.countryName}</span>;
         },
      },
      {
         field: 'region',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.booking.country?.region?.regionName}</span>;
         },
      },
      {
         field: 'date',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.createAt'),
         cellClassName: 'highlight-cell',
         headerClassName: 'pricing-team',
         renderCell(params) {
            return <span>{formatDate(params?.row?.booking.date)}</span>;
         },
      },
      {
         field: 'dealerNet',
         flex: 0.6,
         minWidth: 100,
         headerName: `${t('table.dealerNet')}`,
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell',
         headerClassName: 'pricing-team',
         renderCell(params) {
            return <span>{formatNumber(params?.row.booking.dealerNetAfterSurcharge * 1000)}</span>;
         },
      },

      {
         field: 'marginPercentageAfterSurcharge',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.margin%'),
         cellClassName: 'highlight-cell',
         headerClassName: 'pricing-team',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(params?.row.booking.marginPercentageAfterSurcharge * 100)}
               </span>
            );
         },
      },

      // FP&A team
      {
         field: 'FPA_dealerNet',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.dealerNet'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-FPA',
         headerClassName: 'FPA-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.bookingFPA?.dealerNet &&
                     formatNumber(params?.row.bookingFPA?.dealerNet * 1000)}
               </span>
            );
         },
      },
      {
         field: 'FPA_cost',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.cost'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-FPA',
         headerClassName: 'FPA-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.bookingFPA?.totalCost &&
                     formatNumber(params?.row.bookingFPA?.totalCost * 1000)}
               </span>
            );
         },
      },
      {
         field: 'FPA_margin',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.margin'),
         cellClassName: 'highlight-cell-FPA',
         headerClassName: 'FPA-team',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {params?.row.bookingFPA?.margin &&
                     formatNumber(params?.row.bookingFPA?.margin * 1000)}
               </span>
            );
         },
      },
      {
         field: 'FPA_marginpercentage',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.margin%'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-FPA',
         headerClassName: 'FPA-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.bookingFPA?.marginPercentage &&
                     formatNumberPercentage(params?.row.bookingFPA?.marginPercentage * 100)}
               </span>
            );
         },
      },
      // Actual Order
      {
         field: 'actual_dealerNet',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.dealerNet'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-actual',
         headerClassName: 'actual-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.shipment?.dealerNetAfterSurcharge &&
                     formatNumber(params?.row.shipment?.dealerNetAfterSurcharge * 1000)}
               </span>
            );
         },
      },
      {
         field: 'actual_cost',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.cost'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-actual',
         headerClassName: 'actual-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.shipment?.totalCost &&
                     formatNumber(params?.row.shipment?.totalCost * 1000)}
               </span>
            );
         },
      },
      {
         field: 'actual_margin',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.margin'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-actual',
         headerClassName: 'actual-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.shipment?.marginAfterSurcharge &&
                     formatNumber(params?.row.shipment?.marginAfterSurcharge * 1000)}
               </span>
            );
         },
      },
      {
         field: 'actual_margin%',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.margin%'),
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell-actual',
         headerClassName: 'actual-team',
         renderCell(params) {
            return (
               <span>
                  {params?.row.shipment?.marginPercentageAfterSurcharge &&
                     formatNumberPercentage(
                        params?.row.shipment?.marginPercentageAfterSurcharge * 100
                     )}
               </span>
            );
         },
      },
      {
         field: 'remark',
         flex: 0.4,
         ...centerHeaderColumn,
         minWidth: 80,
         headerName: t('table.remark'),
         renderCell(params) {
            return <span>{params.row.booking.comment}</span>;
         },
      },
   ];

   const columnGroupingModel: GridColumnGroupingModel = [
      {
         groupId: 'pricing_team',
         headerName: 'Pricing Team Booking Margin',
         headerClassName: 'pricing-team',
         children: [
            { field: 'date' },
            { field: 'dealerNet' },
            { field: 'marginPercentageAfterSurcharge' },
         ],
      },
      {
         groupId: 'FPA_team',
         headerName: 'FP&A Team Est. Billing Margin',
         headerClassName: 'FPA-team',
         children: [
            { field: 'FPA_dealerNet' },
            { field: 'FPA_cost' },
            { field: 'FPA_margin' },
            { field: 'FPA_marginpercentage' },
         ],
      },
      {
         groupId: 'actual',
         headerName: 'Actual',
         freeReordering: true,
         headerClassName: 'actual-team',
         children: [
            { field: 'actual_dealerNet' },
            { field: 'actual_cost' },
            { field: 'actual_margin' },
            { field: 'actual_margin%' },
         ],
      },
   ];

   let heightComponentExcludingTable = 170;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');

   if (userRoleState === 'ADMIN') {
      heightComponentExcludingTable = 205;
   }

   useEffect(() => {
      setUserRoleState(userRole);
   });

   const handleUploadFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      bookingMarginTrialTestApi
         .importDataBookingFPA(formData)
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

      dispatch(bookingMarginTrialTestStore.sagaGetList());
   };

   const handleImport = () => {
      if (uploadedFile.length > 0) {
         // resert message
         setLoading(true);
         handleUploadFile(uploadedFile[0]);
      } else {
         dispatch(commonStore.actions.setErrorMessage(t('commonErrorMessage.selectAFileToUpload')));
      }
   };

   const handleRemove = (fileName) => {
      const updateUploaded = uploadedFile.filter((file) => file.name != fileName);
      setUploadedFile(updateUploaded);
   };
   const appendFileIntoList = (file) => {
      setUploadedFile((prevFiles) => [...prevFiles, file]);
   };

   useEffect(() => {
      setListOrder(listShipment);
      setTotalRow(listTotalRow);

      // setListOrder((prev) => {
      //    return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      // });

      // setTotalRow((prev) => {
      //    return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      // });
      convertTimezone();
   }, [listShipment, listTotalRow, currency]);

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
         <AppLayout entity="bookingMarginTrialTest">
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
                     onClick={handleFilterOrderShipment}
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
            {userRoleState === 'ADMIN' && (
               <Grid container spacing={1} sx={{ marginTop: '3px', alignItems: 'end' }}>
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
                  <Typography
                     sx={{
                        color: 'blue',
                        fontSize: 5,
                        margin: '0 30px 0 10px',
                        cursor: 'pointer',
                     }}
                     onClick={() => downloadFileByURL(exampleFile[BOOKING_FPA])}
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
            )}

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
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     columnHeaderHeight={40}
                     rowHeight={30}
                     rowBufferPx={35}
                     getRowId={(params) => params.booking.orderNo}
                     onCellClick={handleOnCellClick}
                     columnGroupingModel={columnGroupingModel}
                     columns={columns}
                     rows={listOrder}
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
               <AppBackDrop open={loadingTable} hightHeaderTable={'113px'} />
            </Paper>
         </AppLayout>
         <ProductDetailDialog
            {...productDetailState}
            handleOpenImageDialog={handleOpenImageDialog}
            onClose={handleCloseProductDetail}
         />
         <ShowImageDialog />
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

// open file and check list column is exit
//function checkColumn();

function UploadFileDropZone(props) {
   const { t } = useTranslation();
   const onDrop = useCallback(
      (acceptedFiles) => {
         acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
               if (props.uploadedFile.length + acceptedFiles.length >= 2) {
                  dispatch(
                     commonStore.actions.setErrorMessage(t('uploadSelectOnlyOneFileAtATime'))
                  );
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
            {t('button.selectFile')}{' '}
         </Button>
      </div>
   );
}
