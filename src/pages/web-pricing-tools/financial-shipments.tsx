import { useContext, useEffect, useState } from 'react';

import { commonStore, shipmentStore } from '@/store/reducers';
import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatDate, formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { setCookie } from 'nookies';
import { useDispatch, useSelector } from 'react-redux';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppTextField,
   DataTablePagination,
} from '@/components';

import { produce } from 'immer';
import _ from 'lodash';

import AppBackDrop from '@/components/App/BackDrop';
import AppDataTable from '@/components/DataTable/AppDataGridPro';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { paperStyle } from '@/theme/paperStyle';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { defaultValueFilterOrder } from '@/utils/defaultValues';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { SHIPMENT } from '@/utils/modelType';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';

import { UploadFileDropZone } from '@/components/App/UploadFileDropZone';
import GetAppIcon from '@mui/icons-material/GetApp';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Shipment() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   const listShipment = useSelector(shipmentStore.selectShipmentList);

   const initDataFilter = useSelector(shipmentStore.selectInitDataFilter);
   const listTotalRow = useSelector(shipmentStore.selectTotalRow);

   const cacheDataFilter = useSelector(shipmentStore.selectDataFilter);

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const serverLastUpdatedTime = useSelector(shipmentStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(shipmentStore.selectLastUpdatedBy);
   const currency = useSelector(shipmentStore.selectCurrency);
   const exampleFile = useSelector(shipmentStore.selectExampleUploadFile);

   //  const [uploadedFile, setUploadedFile] = useState({ name: '' });
   // use importing to control spiner
   const loadingTable = useSelector(shipmentStore.selectLoadingData);
   const loadingPage = useSelector(shipmentStore.selectLoadingPage);
   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);

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
      if (!hasSetDataFilter && Object.keys(cacheDataFilter).length != 0) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            console.log('hehe, ', dataFilter);
            setCookie(null, 'shipmentFilter', JSON.stringify(dataFilter), {
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
      dispatch(shipmentStore.actions.setDefaultValueFilterOrder(dataFilter));
      handleChangePage(1);
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(shipmentStore.sagaGetList());
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
         minWidth: 80,
         headerName: t('table.order#'),
         renderCell(params) {
            return <span>{params.row.id.orderNo}</span>;
         },
      },
      {
         field: 'quoteNumber',
         flex: 0.6,
         minWidth: 70,
         headerName: t('table.quoteNumber'),
      },
      {
         field: 'date',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.createAt'),
         renderCell(params) {
            return <span>{formatDate(params.row.id.date)}</span>;
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
         flex: 0.7,
         minWidth: 100,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.product?.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'dealerName',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.dealerName'),
         renderCell(params) {
            return <span>{params.row.id.dealer?.name}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.series'),
         renderCell(params) {
            return <span>{params.row.series.series}</span>;
         },
      },
      {
         field: 'model',
         flex: 0.6,
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
         flex: 0.5,
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
         flex: 0.6,
         minWidth: 100,
         headerName: `${t('table.dealerNet')} ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNetAfterSurcharge)}</span>;
         },
      },
      {
         field: 'totalCost',
         flex: 0.6,
         minWidth: 80,
         headerName: `${t('table.totalActualCost')} ('000 ${currency})`,
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.totalCost)}</span>;
         },
      },
      {
         field: 'marginAfterSurcharge',
         flex: 0.7,
         minWidth: 150,
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
         cellClassName: 'highlight-cell',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(params?.row.marginPercentageAfterSurcharge * 100)}
               </span>
            );
         },
      },
      {
         field: 'bookingMarginPercentageAfterSurcharge',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.bookingMarginPercentage'),
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {params?.row.bookingMarginPercentageAfterSurcharge &&
                     formatNumberPercentage(
                        params?.row.bookingMarginPercentageAfterSurcharge * 100
                     )}
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
      heightComponentExcludingTable = 329;
   }
   useEffect(() => {
      setUserRoleState(userRole);
   });

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

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setDataFilter(defaultValueFilterOrder);
   };

   const handleUploadShipmentFile = async (file: File) => {
      dispatch(shipmentStore.uploadShipmentFile(file));
   };

   return (
      <>
         <AppLayout entity="shipment">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.listPrice')} ('000 {currency})
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumber(listTotalRow[0]?.dealerNet)}
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
                           {formatNumber(listTotalRow[0]?.dealerNetAfterSurcharge)}
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
                           {formatNumber(listTotalRow[0]?.totalCost)}
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
                              listTotalRow[0]?.marginPercentageAfterSurcharge * 100
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
                           {listTotalRow[0]?.quantity || 0}
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
               <Grid item xs={2} sx={{ zIndex: 20, height: 25, position: 'relative' }}>
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25, position: 'relative' }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.plants, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.plants}
                     label={t('filters.plant')}
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25, position: 'relative' }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.segments, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.segments}
                     label={t('filters.segment')}
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
               <Grid item xs={4} sx={{ paddingRight: 0.5 }}>
                  <Grid item xs={6}>
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
                  <Grid item xs={2}>
                     <UploadFileDropZone
                        handleUploadFile={handleUploadShipmentFile}
                        buttonName="button.uploadShipment"
                     />
                  </Grid>
                  <Typography
                     sx={{
                        color: 'blue',
                        fontSize: 5,
                        margin: '0 30px 0 10px',
                        cursor: 'pointer',
                     }}
                     onClick={() => downloadFileByURL(exampleFile[SHIPMENT])}
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
            )}

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container sx={{ height: `calc(95vh - ${heightComponentExcludingTable}px)` }}>
                  {/* <DataGridPro
                     hideFooter
                     disableColumnMenu
                     sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     columnHeaderHeight={90}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rowHeight={30}
                     rows={listShipment}
                     rowBufferPx={35}
                     columns={columns}
                     getRowId={(params) =>
                        params.id.orderNo + params.id.dealer.name + params.id.date
                     }
                     onCellClick={handleOnCellClick}
                  /> */}
                  <AppDataTable
                     columnHeaderHeight={90}
                     dataFilter={dataFilter}
                     currency={currency}
                     entity={'shipment'}
                     rows={listShipment}
                     columns={columns}
                     getRowId={(params) =>
                        params.id.orderNo + params.id.date + params.id?.dealer?.name
                     }
                     onCellClick={handleOnCellClick}
                  />
               </Grid>
               <DataTablePagination
                  page={tableState.pageNo}
                  perPage={tableState.perPage}
                  totalItems={tableState.totalItems}
                  onChangePage={handleChangePage}
                  onChangePerPage={handleChangePerPage}
                  lastUpdatedAt={serverLastUpdatedTime}
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
         <AppBackDrop open={loadingPage} hightHeaderTable={60} bottom={1} />

         <LogImportFailureDialog />
      </>
   );
}
