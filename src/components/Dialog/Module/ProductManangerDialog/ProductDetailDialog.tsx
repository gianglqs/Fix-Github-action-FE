import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useState } from 'react';
import {
   Dialog,
   Grid,
   Paper,
   TextField,
   Tooltip,
   Typography,
   useMediaQuery,
   useTheme,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { AppTextField } from '@/components/App';
import { commonStore, partStore, productStore } from '@/store/reducers';
import ChooseImage from '@/components/App/chooseImage';
import productApi from '@/api/product.api';
import Image from 'next/image';
import { DataTable, DataTablePagination } from '@/components/DataTable';
import { GridToolbar } from '@mui/x-data-grid-pro';
import { useSelector } from 'react-redux';
import { defaultValueFilterPart } from '@/utils/defaultValues';
import { getProductImagePath } from '@/utils/imagePath';
import partApi from '@/api/part.api';
import { formatNumber } from '@/utils/formatCell';
import {
   centerColumn,
   centerHeaderColumn,
   formatNumbericColumn,
   iconColumn,
} from '@/utils/columnProperties';
import ImageIcon from '@mui/icons-material/Image';

const ProductDetailDialog: React.FC<any> = (props) => {
   const { open, onClose, data } = props;

   // ======== info product detail ========
   const [modelCode, setModelCode] = useState();
   const [brand, setBrand] = useState();
   const [truckType, setTruckType] = useState();
   const [plant, setPlant] = useState();
   const [metaSeries, setMetaseries] = useState();
   const [segment, setSegment] = useState();
   const [family, setFamily] = useState();
   const [clazz, setClazz] = useState();
   const [description, setDescription] = useState();
   const [image, setImage] = useState();

   useEffect(() => {
      if (data) {
         setModelCode(data.modelCode);
         setBrand(data.brand);
         setTruckType(data.truckType);
         setPlant(data.plant);
         setMetaseries(data.metaSeries);
         setSegment(data.segment);
         setFamily(data.family);
         setClazz(data.clazz);
         setDescription(data.description);
         setImage(data.image);
      }
   }, [data]);

   // ======== for list Part =========

   let heightTable = 298;
   const dispatch = useDispatch();

   const tableState = useSelector(commonStore.selectTableState);

   const [listPart, setListPart] = useState([]);
   const [initDataFilter, setInitDataFilter] = useState([]);
   const [dataFilterForGetParts, setDataFilterForGetParts] = useState({
      modelCode: null,
      orderNumbers: [],
   });
   const [pageNo, setPageNo] = useState(1);
   const [perPage, setPerPage] = useState(50);
   const [totalItems, setTotalItems] = useState();

   // set data filter when open parts
   useEffect(() => {
      modelCode && setDataFilterForGetParts((prev) => ({ ...prev, modelCode: modelCode }));
   }, [modelCode]);

   // for OrderNo filter
   useEffect(() => {
      if (modelCode) {
         productApi
            .getProductDetailFilter(modelCode)
            .then((response) => {
               setInitDataFilter(response.data.orderNos);
            })
            .catch((error) => {
               console.log(error);
            });
      }
   }, [modelCode]);

   // get ListPart
   const getDataPartByFilter = () => {
      partApi
         .getPartsForProductDetail(dataFilterForGetParts, { pageNo, perPage })
         .then((response) => {
            setListPart(response.data.listPart);
         })
         .catch((error) => {
            console.log(error);
         });
   };

   //load Parts when open Dialog (when setup dataFilterForGetParts is successfully)
   useEffect(() => {
      getDataPartByFilter();
   }, [dataFilterForGetParts]);

   // load Parts when click Filter
   const handleClickFilter = () => {
      getDataPartByFilter();
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(productStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const columns = [
      {
         field: 'partNumber',
         flex: 0.3,
         headerName: 'Part Number',
      },
      {
         field: 'image',
         flex: 0.2,
         headerName: 'image',
         ...centerHeaderColumn,
         ...iconColumn,
         renderCell(params) {
            return (
               <Tooltip title="Add" placement="top-start" arrow>
                  <ImageIcon />
               </Tooltip>
            );
         },
      },
      {
         field: 'currency',
         flex: 0.2,
         headerName: 'Currency',
         ...centerColumn,
         renderCell(params) {
            return <span>{params.row.currency?.currency}</span>;
         },
      },
      {
         field: 'listPrice',
         flex: 0.3,
         headerName: 'List Price',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.listPrice * 1000)}</span>;
         },
      },
      {
         field: 'description',
         ...centerHeaderColumn,
         flex: 1.4,
         headerName: 'Description',
      },
   ];

   const handleClose = () => {
      onClose();
      resetData();
   };

   // reset when CLOSE dialog
   const resetData = () => {
      setModelCode(null);
      setBrand(null);
      setTruckType(null);
      setPlant(null);
      setMetaseries(null);
      setSegment(null);
      setFamily(null);
      setClazz(null);
      setDescription(null);
      setImage(null);
      setPageNo(1);
      setPerPage(50);
      setTotalItems(null);
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
            <Grid container>
               <Grid spacing={1} container xs={10}>
                  <Grid item xs={3}>
                     <TextField
                        id="outlined-read-only-input"
                        label="Model Code"
                        value={modelCode}
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
                        label="Brand"
                        value={brand}
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
                        label="Truck Type"
                        value={truckType}
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
                        label="Plant"
                        value={plant}
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
                        label="MetaSeries"
                        value={metaSeries}
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
                        label="Segment"
                        value={segment}
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
                        label="Family"
                        value={family}
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
                        label="Class"
                        value={clazz}
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
                     <TextField
                        id="outlined-read-only-input"
                        label="Description"
                        value={description}
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
                        multiline
                     />
                  </Grid>
               </Grid>
               <Grid container xs={2} style={{ paddingLeft: '15px', overflow: 'hidden' }}>
                  <img
                     src={getProductImagePath(image)}
                     height={'100%'}
                     width={'100%'}
                     style={{ objectFit: 'cover', borderRadius: '5px' }}
                  />
               </Grid>
            </Grid>
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
