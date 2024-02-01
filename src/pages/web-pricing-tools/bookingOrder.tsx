import { useCallback, useContext, useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage, formatDate } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { bookingStore, commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';

import { rowColor } from '@/theme/colorRow';

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

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

interface FileChoosed {
   name: string;
}

export default function Booking() {
   const dispatch = useDispatch();
   const listBookingOrder = useSelector(bookingStore.selectBookingList);
   const listTotalRow = useSelector(bookingStore.selectTotalRow);
   const initDataFilter = useSelector(bookingStore.selectInitDataFilter);
   const listExchangeRate = useSelector(bookingStore.selectExchangeRateList);

   const [dataFilter, setDataFilter] = useState(defaultValueFilterOrder);

   const [loading, setLoading] = useState(false);

   const [uploadedFile, setUploadedFile] = useState<FileChoosed[]>([]);

   const [listOrder, setListOrder] = useState(listBookingOrder);

   const [totalRow, setTotalRow] = useState(listTotalRow);

   const [currency, setCurrency] = useState('USD');

   const appendFileIntoList = (file) => {
      setUploadedFile((prevFiles) => [...prevFiles, file]);
   };

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

   const handleFilterOrderBooking = () => {
      dispatch(bookingStore.actions.setDefaultValueFilterBooking(dataFilter));
      handleChangePage(1);
   };

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
         headerName: 'Order #',
      },
      {
         field: 'date',
         flex: 0.5,
         headerName: 'Create at',
         renderCell(params) {
            return <span>{formatDate(params?.row?.date)}</span>;
         },
      },
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
         renderCell(params) {
            return <span>{params.row.region?.regionName}</span>;
         },
      },
      {
         field: 'ctryCode',
         flex: 0.3,
         headerName: 'Country',
      },
      {
         field: 'dealerName',
         flex: 1.2,
         headerName: 'Dealer Name',
      },
      {
         field: 'Plant',
         flex: 0.6,
         headerName: 'Plant',
         renderCell(params) {
            return <span>{params.row.productDimension?.plant}</span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: 'Class',
         renderCell(params) {
            return <span>{params.row.productDimension?.clazz}</span>;
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
            return (
               <span style={{ cursor: 'pointer' }}>{params.row.productDimension.modelCode}</span>
            );
         },
      },
      {
         field: 'quantity',
         flex: 0.3,
         headerName: 'Qty',
         ...formatNumbericColumn,
      },

      {
         field: 'dealerNet',
         flex: 0.8,
         headerName: `DN ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNet)}</span>;
         },
      },
      {
         field: 'dealerNetAfterSurCharge',
         flex: 0.8,
         headerName: `DN After Surcharge ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.dealerNetAfterSurCharge)}</span>;
         },
      },
      {
         field: 'totalCost',
         flex: 0.8,
         headerName: `Total Cost ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.totalCost)}</span>;
         },
      },
      {
         field: 'marginAfterSurCharge',
         flex: 0.7,
         headerName: `Margin $ After Surcharge ('000 ${currency})`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.marginAfterSurCharge)}</span>;
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
                  {formatNumberPercentage(params?.row.marginPercentageAfterSurCharge * 100)}
               </span>
            );
         },
      },
      {
         field: 'aopmarginPercentage',
         flex: 0.6,
         headerName: 'AOP Margin %',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.aopmarginPercentage * 100)}</span>;
         },
      },
   ];

   const totalColumns = [
      {
         field: 'orderNo',
         flex: 0.4,
         headerName: 'Order #',
      },
      {
         field: 'date',
         flex: 0.5,
         headerName: 'Create at',
         renderCell(params) {
            return <span>{formatDate(params?.row?.date)}</span>;
         },
      },
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
         renderCell(params) {
            return <span>{params.row.region?.region}</span>;
         },
      },
      {
         field: 'ctryCode',
         flex: 0.3,
         headerName: 'Country',
      },
      {
         field: 'dealerName',
         flex: 1.2,
         headerName: 'Dealer Name',
      },
      {
         field: 'Plant',
         flex: 0.6,
         headerName: 'Plant',
         renderCell(params) {
            return <span>{params.row.productDimension?.plant}</span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: 'Class',
         renderCell(params) {
            return <span>{params.row.productDimension?.clazz}</span>;
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
            return <span>{params.row.model}</span>;
         },
      },
      {
         field: 'quantity',
         flex: 0.3,
         headerName: 'Qty',
         ...formatNumbericColumn,
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
            return <span>{formatNumber(params?.row.dealerNetAfterSurCharge)}</span>;
         },
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
         field: 'marginAfterSurCharge',
         flex: 0.7,
         headerName: 'Margin $ After Surcharge',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.marginAfterSurCharge)}</span>;
         },
      },
      {
         field: 'marginPercentageAfterSurCharges',
         flex: 0.6,
         headerName: 'Margin % After Surcharge',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>
                  {formatNumberPercentage(params?.row.marginPercentageAfterSurCharge * 100)}
               </span>
            );
         },
      },
      {
         field: 'noShow',
         flex: 0.6,
      },
   ];

   let heightComponentExcludingTable = 293;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');
   if (userRoleState === 'ADMIN') {
      heightComponentExcludingTable = 330;
   }
   useEffect(() => {
      setUserRoleState(userRole);
   });

   const handleUploadFile = async (files) => {
      let formData = new FormData();
      files.map((file) => {
         formData.append('files', file);
      });

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
      //refresh data table and paging
      dispatch(bookingStore.sagaGetList());
   };

   const handleImport = () => {
      if (uploadedFile.length > 0) {
         // resert message
         setLoading(true);
         handleUploadFile(uploadedFile);
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
      setListOrder(listBookingOrder);
      setTotalRow(listTotalRow);

      setListOrder((prev) => {
         return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      });

      setTotalRow((prev) => {
         return convertCurrencyOfDataBookingOrder(prev, currency, listExchangeRate);
      });
   }, [listBookingOrder, listTotalRow, currency]);

   // ===== show Product detail =======
   const [productDetailState, setProductDetailState] = useState({
      open: false,
      model: null,
      orderNo: null,
   });

   const handleCloseProductDetail = () => {
      setProductDetailState({
         open: false,
         model: null,
         orderNo: null,
      });
   };

   // ===== show Image ======/
   const [imageDialogState, setImageDialogState] = useState({
      open: false,
      imageUrl: null,
   });

   const handleOpenImageDialog = (imageUrl) => {
      imageUrl &&
         setImageDialogState({
            open: true,
            imageUrl: imageUrl,
         });
   };

   const handleCloseImageDialog = () => {
      setImageDialogState({
         open: false,
         imageUrl: null,
      });
   };

   // handle prevent open ProductDetail Dialog when click button edit
   const handleOnCellClick = (params, event) => {
      console.log(params.row.productdimension?.modelCode);
      console.log(params.id);
      if (params.field === 'model') {
         event.stopPropagation();
         setProductDetailState({
            open: true,
            model: params.row.productDimension?.modelCode,
            orderNo: params.id,
         });
      }
   };
   return (
      <>
         <AppLayout entity="booking">
            <Grid container spacing={1}>
               <Grid item xs={4}>
                  <Grid item xs={12}>
                     <AppTextField
                        onChange={(e) => handleChangeDataFilter(e.target.value, 'orderNo')}
                        name="orderNo"
                        label="Order #"
                        placeholder="Search order by ID"
                     />
                  </Grid>
               </Grid>
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
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.segments}
                     label="Segment"
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
                     options={initDataFilter.AOPMarginPercentageGroup}
                     label="AOP Margin %"
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
                        Import
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

            <Paper elevation={1} sx={{ marginTop: 2 }}>
               <Grid container sx={{ height: `calc(100vh - ${heightComponentExcludingTable}px)` }}>
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
               <DataGridPro
                  sx={rowColor}
                  getCellClassName={(params: GridCellParams<any, any, number>) => {
                     return 'total';
                  }}
                  hideFooter
                  columnHeaderHeight={0}
                  disableColumnMenu
                  rowHeight={30}
                  rows={totalRow}
                  rowBuffer={35}
                  rowThreshold={25}
                  columns={totalColumns}
                  getRowId={(params) => params.orderNo}
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
      </>
   );
}

function UploadFileDropZone(props) {
   const onDrop = useCallback(
      (acceptedFiles) => {
         acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
               if (props.uploadedFile.length + acceptedFiles.length >= 3) {
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
      maxFiles: 2,
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
            Select file
         </Button>
      </div>
   );
}
