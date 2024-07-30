import { useContext, useEffect, useState } from 'react';

import { commonStore, importFailureStore, productStore } from '@/store/reducers';
import { useDispatch, useSelector } from 'react-redux';

import { Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

import {
   AppAutocomplete,
   AppLayout,
   AppTextField,
   DataTablePagination,
   EditIcon,
} from '@/components';
import AppDataTable from '@/components/DataTable/AppDataGridPro';
import { produce } from 'immer';
import _ from 'lodash';

import { defaultValueFilterProduct } from '@/utils/defaultValues';

import { UserInfoContext } from '@/provider/UserInfoContext';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { When } from 'react-if';

import AppBackDrop from '@/components/App/BackDrop';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import ShowImageDialog from '@/components/Dialog/Module/ProductManangerDialog/ImageDialog';
import { ProductDetailDialog } from '@/components/Dialog/Module/ProductManangerDialog/ProductDetailDialog';
import { DialogUpdateProduct } from '@/components/Dialog/Module/ProductManangerDialog/UpdateDialog';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { iconColumn } from '@/utils/columnProperties';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { PRODUCT_APAC } from '@/utils/modelType';
import { selectProductRowById } from '@/utils/selectRowById';
import { GetServerSidePropsContext } from 'next';
import { setCookie } from 'nookies';
import { useTranslation } from 'react-i18next';

import { UploadFileDropZone } from '@/components/App/UploadFileDropZone';
import GetAppIcon from '@mui/icons-material/GetApp';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Product() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   const listProduct = useSelector(productStore.selectProductList);
   const initDataFilter = useSelector(productStore.selectInitDataFilter);
   const cacheDataFilter = useSelector(productStore.selectDataFilter);
   const exampleFile = useSelector(productStore.selectExampleUploadFile);
   const loadingPage = useSelector(productStore.selectLoadingPage);

   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const [loadingTable, setLoadingTable] = useState(false);

   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);

   // import failure dialog
   const importFailureDialogDataFilter = useSelector(importFailureStore.selectDataFilter);

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
         renderCell(params) {
            return <span>{params.row.series.series}</span>;
         },
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
         renderCell(params) {
            return <span>{params.row?.segmentGroup.name}</span>;
         },
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
                        params.row.series.series,
                        params.row.image,
                        params.row.description
                     )
                  }
               />
            );
         },
      },
   ];

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
         console.log(error);
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
   const serverLastUpdatedTime = useSelector(productStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(productStore.selectLastUpdatedBy);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   useEffect(() => {
      convertTimezone();
   }, [serverLastUpdatedTime, serverTimeZone]);

   const handleUploadProductFile = async (file: File) => {
      dispatch(productStore.uploadProductFile(file));
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
                        label={t('filters.models')}
                        placeholder={t('filters.searchProductByModel')}
                        value={dataFilter.modelCode}
                        isTrim
                        focused
                     />
                  </Grid>
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 20, height: 25, position: 'relative' }}>
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
                     value={_.map(dataFilter.family, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.family}
                     label={t('filters.family')}
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
                     value={_.map(dataFilter.brands, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.brands}
                     label={t('filters.brand')}
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
                     sx={{ height: 25, zIndex: 10, position: 'relative' }}
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
               <Grid container spacing={1} sx={{ marginTop: '3px', alignItems: 'end' }}>
                  <Grid item xs={1}>
                     <UploadFileDropZone
                        handleUploadFile={handleUploadProductFile}
                        buttonName="button.uploadFile"
                     />
                  </Grid>

                  <Typography
                     sx={{
                        color: 'blue',
                        fontSize: 5,
                        margin: '0 30px 0 10px',
                        cursor: 'pointer',
                     }}
                     onClick={() => downloadFileByURL(exampleFile[PRODUCT_APAC])}
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

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container>
                  <Grid
                     container
                     sx={{ height: `calc(100vh - ${heightComponentExcludingTable}px)` }}
                  >
                     <AppDataTable
                        hideFooter
                        currency="USD"
                        entity={'product'}
                        sx={{
                           '& .MuiDataGrid-columnHeaderTitle': {
                              whiteSpace: 'break-spaces',
                              lineHeight: 1.2,
                           },
                        }}
                        dataFilter={dataFilter}
                        columnHeaderHeight={60}
                        rowHeight={30}
                        rows={listProduct}
                        rowBufferPx={35}
                        columns={columns}
                        getRowId={(params) => params.id}
                        onRowClick={handleOpenProductDetailDialog}
                        onCellClick={handleOnCellClick}
                     />
                  </Grid>
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
               <AppBackDrop open={loadingTable} hightHeaderTable={'74px'} bottom={'43px'} />
            </Paper>
         </AppLayout>
         <DialogUpdateProduct
            {...updateProductState}
            onClose={handleCloseUpdateProductDialog}
            handleOpenImageDialog={handleOpenImageDialog}
         />
         <ProductDetailDialog
            {...productDetailState}
            handleOpenImageDialog={handleOpenImageDialog}
            onClose={handleCloseProductDetail}
         />
         <ShowImageDialog />
         <LogImportFailureDialog />
         <AppBackDrop open={loadingPage} hightHeaderTable={60} bottom={1} />
      </>
   );
}
