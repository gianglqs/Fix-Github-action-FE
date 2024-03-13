import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { Button, Dialog, Grid, Paper, TextField } from '@mui/material';
import { AppAutocomplete, AppTextField } from '@/components/App';
import productApi from '@/api/product.api';
import { DataTable, DataTablePagination } from '@/components/DataTable';
import { GridToolbar } from '@mui/x-data-grid-pro';
import { getPartImagePath, getProductImagePath } from '@/utils/imagePath';
import partApi from '@/api/part.api';
import { formatNumber } from '@/utils/formatCell';
import {
   centerColumn,
   centerHeaderColumn,
   formatNumbericColumn,
   iconColumn,
} from '@/utils/columnProperties';
import PartImageTooltip from '@/components/App/Tooltip/ImageTootip/Part';
import { produce } from 'immer';
import { When } from 'react-if';
import { ProductImage } from '@/components/App/Image/ProductImage';
import { useTranslation } from 'react-i18next';

const ProductDetailDialog: React.FC<any> = (props) => {
   const { open, onClose, model, _series, orderNo, handleOpenImageDialog } = props;

   // ======== info product detail ========
   const [modelCode, setModelCode] = useState();
   const [series, setSeries] = useState();
   const [productDetail, setProductDetail] = useState(null);
   const [orderNumber, setOrderNumber] = useState();
   const { t } = useTranslation();

   useEffect(() => {
      setModelCode(model);
   }, [model]);

   useEffect(() => {
      setSeries(_series);
   }, [_series]);

   useEffect(() => {
      setOrderNumber(orderNo);
   }, [orderNo]);

   //get ProductDetail
   useEffect(() => {
      if (modelCode && series) {
         productApi
            .getProductDetail(modelCode, series)
            .then((response) => {
               setProductDetail(JSON.parse(String(response.data)));
            })
            .catch((error) => {
               console.log(error);
            });
      }
   }, [modelCode, series]);

   // ======== for list Part =========

   let heightTable = 415;

   const [listPart, setListPart] = useState([]);
   const [initDataFilter, setInitDataFilter] = useState({} as any);
   const [dataFilterForGetParts, setDataFilterForGetParts] = useState({
      modelCode: null,
      metaSeriez: null,
      orderNumbers: [],
   });
   const [pageNo, setPageNo] = useState(1);
   const [perPage, setPerPage] = useState(20);
   const [totalItems, setTotalItems] = useState();

   // set modelCode in data filter part
   useEffect(() => {
      if (modelCode && series) {
         setDataFilterForGetParts((prev) => ({
            orderNumbers: [orderNumber],
            modelCode: modelCode,
            metaSeriez: series,
         }));
      }
   }, [modelCode, series, orderNumber]);

   // get orderNo filter
   useEffect(() => {
      if (modelCode && series && !orderNo) {
         productApi
            .getProductDetailFilter(modelCode, series)
            .then((response) => {
               setInitDataFilter(JSON.parse(String(response.data)));
            })
            .catch((error) => {
               console.log(error);
            });
      }
   }, [modelCode, series]);

   // get ListPart and totalItems
   const getDataPartByFilter = () => {
      partApi
         .getPartsForProductDetail(dataFilterForGetParts, { pageNo, perPage })
         .then((response) => {
            setListPart(response.data.listPart);
            setTotalItems(response.data.totalItems);
         })
         .catch((error) => {
            console.log(error);
         });
   };

   //load Parts when open Dialog (when setup dataFilterForGetParts is successfully)
   useEffect(() => {
      if (modelCode && series) {
         getDataPartByFilter();
      }
   }, [dataFilterForGetParts]);

   // Load Parts when change pageNo and perPage
   useEffect(() => {
      getDataPartByFilter();
   }, [pageNo, perPage]);

   const handleChangeDataFilter = (option, field) => {
      setDataFilterForGetParts((prev) =>
         produce(prev, (draft) => {
            draft[field] = option.map(({ value }) => value);
         })
      );
   };

   // load Parts when click Filter
   const handleClickFilter = () => {
      setPageNo(1);
      getDataPartByFilter();
   };

   const handleChangePage = (pageNo: number) => {
      setPageNo(pageNo);
   };

   const handleChangePerPage = (perPage: number) => {
      setPageNo(1);
      setPerPage(perPage);
   };

   const columns = [
      {
         field: 'partNumber',
         flex: 0.3,
         headerName: t('table.partNumber'),
      },
      {
         field: 'image',
         flex: 0.2,
         headerName: t('table.image'),
         ...centerHeaderColumn,
         ...iconColumn,
         renderCell(params) {
            return (
               <PartImageTooltip
                  imageName={params.row.image}
                  onClick={() => handleOpenImageDialog(getPartImagePath(params.row.image))}
               />
            );
         },
      },
      {
         field: 'currency',
         flex: 0.2,
         headerName: t('table.currency'),
         ...centerColumn,
         renderCell(params) {
            return <span>{params.row.currency?.currency}</span>;
         },
      },
      {
         field: 'listPrice',
         flex: 0.3,
         headerName: t('table.listPrice'),
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.listPrice * 1000)}</span>;
         },
      },
      {
         field: 'description',
         ...centerHeaderColumn,
         flex: 1.4,
         headerName: t('table.description'),
      },
   ];

   const handleClose = () => {
      onClose();
      setTimeout(resetData, 500);
   };

   // reset when CLOSE dialog
   const resetData = () => {
      setPageNo(1);
      setPerPage(20);
      setTotalItems(null);
      setProductDetail(null);
      setOrderNumber(null);
      setSeries(null);
   };

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         draggable
         fullWidth={true}
         maxWidth="lg"
         PaperProps={{ sx: { borderRadius: '10px' } }}
      >
         <Grid container sx={{ padding: '40px' }}>
            <Grid container sx={{ marginBottom: '7px' }}>
               <Grid spacing={1} container xs={10}>
                  <Grid item xs={3}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.models')}
                        value={productDetail?.modelCode}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.brand')}
                        value={productDetail?.brand}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.truckType')}
                        value={productDetail?.truckType}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.plant')}
                        value={productDetail?.plant}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={2}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.series')}
                        value={productDetail?.series}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={5}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.segment')}
                        value={productDetail?.segment}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={3}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.family')}
                        value={productDetail?.family}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={2}>
                     <TextField
                        id="outlined-read-only-input"
                        label={t('table.class')}
                        value={productDetail?.clazz.clazzName}
                        defaultValue=" "
                        InputProps={{
                           readOnly: true,
                           style: {
                              height: '30px',
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                     />
                  </Grid>
                  <Grid item xs={12}>
                     <AppTextField
                        id="outlined-read-only-input"
                        label={t('table.description')}
                        value={productDetail?.description}
                        defaultValue=" "
                        rows={3}
                        InputProps={{
                           readOnly: true,
                           style: {
                              fontSize: 15,
                           },
                        }}
                        InputLabelProps={{
                           style: {
                              fontSize: 13,
                           },
                        }}
                        margin="dense"
                        multiline
                     />
                  </Grid>
               </Grid>
               <Grid container xs={2} style={{ paddingLeft: '15px', overflow: 'hidden' }}>
                  <ProductImage
                     imageUrl={productDetail?.image}
                     style={{
                        objectFit: 'contain',
                        borderRadius: '5px',
                        maxHeight: '180px',
                        height: '100%',
                        width: '100%',
                     }}
                     onClick={() => handleOpenImageDialog(productDetail?.image)}
                  />
               </Grid>
            </Grid>
            <When condition={orderNumber === null || orderNumber === undefined}>
               <Grid container spacing={2} sx={{ marginBottom: '7px' }}>
                  <Grid item xs={4} sx={{ zIndex: 10, height: 25 }}>
                     <AppAutocomplete
                        options={initDataFilter.orderNos}
                        label={t('filters.order#')}
                        sx={{ height: 25, zIndex: 10 }}
                        onChange={(e, option) => handleChangeDataFilter(option, 'orderNumbers')}
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
                        onClick={handleClickFilter}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.filter')}
                     </Button>
                  </Grid>
               </Grid>
            </When>
            <Grid xs={12}>
               <Paper elevation={1}>
                  <Grid container xs={12}>
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
                        rowHeight={50}
                        slots={{
                           toolbar: GridToolbar,
                        }}
                        rows={listPart}
                        rowBuffer={35}
                        rowThreshold={25}
                        columns={columns}
                        checkboxSelection
                        getRowId={(params) => params.id}
                     />
                  </Grid>

                  <DataTablePagination
                     page={pageNo}
                     perPage={perPage}
                     totalItems={totalItems}
                     onChangePage={handleChangePage}
                     onChangePerPage={handleChangePerPage}
                  />
               </Paper>
            </Grid>
         </Grid>
      </Dialog>
   );
};

export { ProductDetailDialog };
