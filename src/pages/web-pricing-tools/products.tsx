import { useCallback, useContext, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { productStore, commonStore, importFailureStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';
import moment from 'moment-timezone';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button, CircularProgress, ListItem, Typography } from '@mui/material';

import {
   AppAutocomplete,
   AppLayout,
   AppTextField,
   DataTable,
   DataTablePagination,
   EditIcon,
} from '@/components';

import _ from 'lodash';
import { produce } from 'immer';

import { defaultValueFilterProduct } from '@/utils/defaultValues';
import { GridToolbar } from '@mui/x-data-grid-pro';

import ClearIcon from '@mui/icons-material/Clear';
import React from 'react';
import { When } from 'react-if';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';

import { GetServerSidePropsContext } from 'next';
import { iconColumn } from '@/utils/columnProperties';
import { DialogUpdateProduct } from '@/components/Dialog/Module/ProductManangerDialog/UpdateDialog';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import { selectProductRowById } from '@/utils/selectRowById';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import productApi from '@/api/product.api';
import AppBackDrop from '@/components/App/BackDrop';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { setCookie } from 'nookies';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { useTranslation } from 'react-i18next';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { extractTextInParentheses } from '@/utils/getString';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

interface FileChoosed {
   name: string;
}

export default function Product() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   const listProduct = useSelector(productStore.selectProductList);
   const initDataFilter = useSelector(productStore.selectInitDataFilter);
   const cacheDataFilter = useSelector(productStore.selectDataFilter);

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const [loading, setLoading] = useState(false);

   const [loadingTable, setLoadingTable] = useState(false);

   const [uploadedFile, setUploadedFile] = useState<FileChoosed[]>([]);
   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);

   // import failure dialog
   const importFailureDialogDataFilter = useSelector(importFailureStore.selectDataFilter);

   const appendFileIntoList = (file) => {
      setUploadedFile((prevFiles) => [...prevFiles, file]);
   };

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['modelCode'], field)) {
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
            console.log('hehe, ', dataFilter);

            setCookie(null, 'productFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterProduct();
         }
      }, 700);
      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   useEffect(() => {
      setLoadingTable(false);
   }, [listProduct]);

   const handleFilterProduct = () => {
      setLoadingTable(true);
      dispatch(productStore.actions.setDefaultValueFilterProduct(dataFilter));
      handleChangePage(1);
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(productStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const tableState = useSelector(commonStore.selectTableState);

   let heightComponentExcludingTable = 218;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');
   if (userRoleState === 'ADMIN') {
      heightComponentExcludingTable = 253;
   }
   useEffect(() => {
      setUserRoleState(userRole);
   });

   const columns = [
      {
         field: 'modelCode',
         flex: 0.4,
         minWidth: 100,
         headerName: t('table.models'),
      },
      {
         field: 'series',
         flex: 0.3,
         minWidth: 100,
         headerName: t('table.series'),
      },
      {
         field: 'brand',
         flex: 0.3,
         minWidth: 100,
         headerName: t('table.brand'),
      },
      {
         field: 'clazz',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'plant',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.plant'),
      },
      {
         field: 'segment',
         flex: 0.8,
         minWidth: 150,
         headerName: t('table.segment'),
      },

      {
         field: 'family',
         flex: 0.6,
         minWidth: 150,
         headerName: t('table.family'),
      },

      {
         field: 'truckType',
         flex: 0.6,
         minWidth: 150,
         headerName: t('table.truckType'),
      },
      {
         field: 'description',
         flex: 1,
         minWidth: 200,
         headerName: t('table.description'),
      },

      userRoleState === 'ADMIN' && {
         ...iconColumn,
         headerName: t('table.edit'),
         flex: 0.2,
         renderCell(params) {
            return (
               <EditIcon
                  onClick={() =>
                     handleOpenUpdateColorDialog(
                        params.row.modelCode,
                        params.row.series,
                        params.row.image,
                        params.row.description
                     )
                  }
               />
            );
         },
      },
   ];

   const handleUploadFile = async (file) => {
      let formData = new FormData();

      formData.append('file', file[0]);

      console.log(formData);

      productApi
         .importDataProduct(formData)
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

      //refresh data table and paging
      dispatch(productStore.sagaGetList());
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

   const [updateProductState, setUpdateProductState] = useState({
      open: false,
      preValue: {} as any,
   });

   const handleOpenUpdateColorDialog = async (
      modelCode: string,
      series: string,
      imageUrl: string,
      des: string
   ) => {
      try {
         // Open form
         setUpdateProductState({
            open: true,
            preValue: {
               modelCode: modelCode,
               series: series,
               image: imageUrl,
               description: des,
            },
         });
      } catch (error) {
         // dispatch(commonStore.actions.setErrorMessage(error))
      }
   };

   const handleCloseUpdateProductDialog = () => {
      setUpdateProductState({
         open: false,
         preValue: {},
      });
   };

   // ===== show Product detail =======
   const [productDetailState, setProductDetailState] = useState({
      open: false,
      model: null,
      _series: null,
   });

   const handleCloseProductDetail = () => {
      setProductDetailState({
         open: false,
         model: null,
         _series: null,
      });
   };

   const handleOpenProductDetailDialog = (row) => {
      const data = selectProductRowById(listProduct, row.id);
      console.log(data);
      data &&
         setProductDetailState({
            open: true,
            model: data[0].modelCode,
            _series: data[0].series,
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
      if (params.field === '') event.stopPropagation();
   };

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setDataFilter(defaultValueFilterProduct);
   };

   const serverTimeZone = useSelector(productStore.selectServerTimeZone);
   const serverLatestUpdatedTime = useSelector(productStore.selectLatestUpdatedTime);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const convertTimezone = () => {
      if (serverLatestUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLatestUpdatedTime, serverTimeZone)
         );
      }
   };

   useEffect(() => {
      convertTimezone();
   }, [serverLatestUpdatedTime, serverTimeZone]);

   return (
      <>
         <AppLayout entity="product">
            <Grid container spacing={1}>
               <Grid item xs={4}>
                  <Grid item xs={12}>
                     <AppTextField
                        onChange={(e) => handleChangeDataFilter(e.target.value, 'modelCode')}
                        name="orderNo"
                        label={t('filters.models')}
                        placeholder={t('filters.searchProductByModel')}
                        value={dataFilter.modelCode}
                        focused
                     />
                  </Grid>
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.classes, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.classes}
                     label={t('filters.class')}
                     onChange={(e, option) => handleChangeDataFilter(option, 'classes')}
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
                     value={_.map(dataFilter.family, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.family}
                     label={t('filters.family')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'family')}
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
                     value={_.map(dataFilter.brands, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.brands}
                     label={t('filters.brand')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'brands')}
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
                     value={_.map(dataFilter.truckType, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.truckType}
                     label={t('filters.truckType')}
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'truckType')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleFilterProduct}
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
                     {t('button.clear')}{' '}
                  </Button>
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

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container>
                  <DataTable
                     hideFooter
                     disableColumnMenu
                     sx={{
                        '& .MuiDataGrid-columnHeaderTitle': {
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     tableHeight={`calc(100vh - ${heightComponentExcludingTable}px)`}
                     columnHeaderHeight={60}
                     rowHeight={30}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rows={listProduct}
                     rowBuffer={35}
                     rowThreshold={25}
                     columns={columns}
                     getRowId={(params) => params.id}
                     onRowClick={handleOpenProductDetailDialog}
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
               <AppBackDrop open={loadingTable} hightHeaderTable={'74px'} bottom={'43px'} />
            </Paper>
         </AppLayout>
         <DialogUpdateProduct {...updateProductState} onClose={handleCloseUpdateProductDialog} />
         <ProductDetailDialog
            {...productDetailState}
            handleOpenImageDialog={handleOpenImageDialog}
            onClose={handleCloseProductDetail}
         />
         <ShowImageDialog {...imageDialogState} onClose={handleCloseImageDialog} />
         <LogImportFailureDialog />
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
      maxFiles: 1,
      accept: {
         'excel/xlsx': ['.xlsx'],
      },
   });
   const dispatch = useDispatch();
   const { t } = useTranslation();
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
