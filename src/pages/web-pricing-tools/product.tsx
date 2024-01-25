import { useCallback, useContext, useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { productStore, commonStore } from '@/store/reducers';
import { useDropzone } from 'react-dropzone';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button, CircularProgress, ListItem } from '@mui/material';

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
import { selectDataRowById } from '@/utils/selectRowById';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

interface FileChoosed {
   name: string;
}

export default function Product() {
   const dispatch = useDispatch();
   const listProduct = useSelector(productStore.selectProductList);
   const initDataFilter = useSelector(productStore.selectInitDataFilter);

   const [dataFilter, setDataFilter] = useState(defaultValueFilterProduct);

   const [loading, setLoading] = useState(false);

   const [uploadedFile, setUploadedFile] = useState<FileChoosed[]>([]);

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

   const handleFilterProduct = () => {
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

   const columns = [
      {
         field: 'modelCode',
         flex: 0.4,
         headerName: 'Model Code',
      },
      {
         field: 'brand',
         flex: 0.3,
         headerName: 'Brand',
      },
      {
         field: 'clazz',
         flex: 0.5,
         headerName: 'Class',
      },
      {
         field: 'plant',
         flex: 0.5,
         headerName: 'Plant',
      },
      {
         field: 'segment',
         flex: 0.8,
         headerName: 'Segment',
      },

      {
         field: 'metaSeries',
         flex: 0.3,
         headerName: 'MetaSeries',
      },
      {
         field: 'family',
         flex: 0.6,
         headerName: 'Family',
      },

      {
         field: 'truckType',
         flex: 0.6,
         headerName: 'Truck Type',
      },
      {
         field: 'description',
         flex: 1,
         headerName: 'Description',
      },
      {
         ...iconColumn,
         headerName: 'Edit',
         flex: 0.2,
         renderCell(params) {
            return (
               <EditIcon
                  onClick={() =>
                     handleOpenUpdateColorDialog(
                        params.row.modelCode,
                        params.row.image,
                        params.row.description
                     )
                  }
               />
            );
         },
      },
   ];

   let heightTable = 218;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');
   if (userRoleState === 'ADMIN') {
      heightTable = 253;
   }
   useEffect(() => {
      setUserRoleState(userRole);
   });

   // const handleUploadFile = async (files) => {
   //    let formData = new FormData();
   //    files.map((file) => {
   //       formData.append('files', file);
   //    });

   //    bookingApi
   //       .importDataBooking(formData)
   //       .then((response) => {
   //          setLoading(false);
   //          handleWhenImportSuccessfully(response);
   //       })
   //       .catch((error) => {
   //          // stop spiner
   //          setLoading(false);
   //          //show message
   //          dispatch(commonStore.actions.setErrorMessage(error.message));
   //       });
   // };

   const handleWhenImportSuccessfully = (res) => {
      //show message
      dispatch(commonStore.actions.setSuccessMessage(res.data.message));
      //refresh data table and paging
      dispatch(productStore.sagaGetList());
   };

   // const handleImport = () => {
   //    if (uploadedFile.length > 0) {
   //       // resert message
   //       setLoading(true);
   //       handleUploadFile(uploadedFile);
   //    } else {
   //       dispatch(commonStore.actions.setErrorMessage('No file choosed'));
   //    }
   // };

   const handleRemove = (fileName) => {
      const updateUploaded = uploadedFile.filter((file) => file.name != fileName);
      setUploadedFile(updateUploaded);
   };

   const [updateProductState, setUpdateProductState] = useState({
      open: false,
      preValue: {} as any,
   });

   const handleOpenUpdateColorDialog = async (modelCode: string, imageUrl: string, des: string) => {
      try {
         // Open form
         setUpdateProductState({
            open: true,
            preValue: {
               modelCode: modelCode,
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
      data: null,
   });

   const handleCloseProductDetail = () => {
      setProductDetailState({
         open: false,
         data: null,
      });
   };

   const handleOpenProductDetailDialog = (row) => {
      const data = selectDataRowById(listProduct, 'modelCode', row.id);
      data &&
         setProductDetailState({
            open: true,
            data: data[0],
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
      if (params.field === '') event.stopPropagation();
   };

   return (
      <>
         <AppLayout entity="product">
            <Grid container spacing={1}>
               <Grid item xs={4}>
                  <Grid item xs={12}>
                     <AppTextField
                        onChange={(e) => handleChangeDataFilter(e.target.value, 'modelCode')}
                        name="orderNo"
                        label="Model Code"
                        placeholder="Search Product by Model"
                     />
                  </Grid>
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.classes}
                     label="Class"
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
                     options={initDataFilter.family}
                     label="Family"
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
                     options={initDataFilter.brands}
                     label="Brand"
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
                     options={initDataFilter.truckType}
                     label="Truck Type"
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

               <Grid item xs={2}>
                  <Button
                     variant="contained"
                     onClick={handleFilterProduct}
                     sx={{ width: '100%', height: 24 }}
                  >
                     Filter
                  </Button>
               </Grid>
            </Grid>

            <When condition={userRoleState === 'ADMIN'}>
               <Grid container spacing={1} sx={{ marginTop: '3px' }}>
                  <Grid item xs={1}>
                     <UploadFileDropZone
                        uploadedFile={uploadedFile}
                        setUploadedFile={appendFileIntoList}
                        //  handleUploadFile={handleUploadFile}
                     />
                  </Grid>
                  <Grid item xs={1}>
                     <Button
                        variant="contained"
                        // onClick={handleImport}
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
                     tableHeight={`calc(100vh - ${heightTable}px)`}
                     columnHeaderHeight={60}
                     rowHeight={30}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rows={listProduct}
                     rowBuffer={35}
                     rowThreshold={25}
                     columns={columns}
                     getRowId={(params) => params.modelCode}
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
               />
            </Paper>
         </AppLayout>
         <DialogUpdateProduct {...updateProductState} onClose={handleCloseUpdateProductDialog} />
         <ProductDetailDialog
            {...productDetailState}
            handleOpenImageDialog={handleOpenImageDialog}
            onClose={handleCloseProductDetail}
         />
         <ShowImageDialog {...imageDialogState} onClose={handleCloseImageDialog} />
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
