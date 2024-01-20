import { useDispatch } from 'react-redux';
import { AppDialog } from '../AppDialog/AppDialog';
import { useEffect, useState } from 'react';
import { Dialog, Grid, Paper, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
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
   };

   // ======== for list Part =========

   let heightTable = 198;
   const dispatch = useDispatch();
   const listPartFromStore = useSelector(partStore.selectPartList);
   const initDataFilterFromStore = useSelector(partStore.selectInitDataFilter);
   const tableState = useSelector(commonStore.selectTableState);

   const [listPart, setListPart] = useState(listPartFromStore);
   const [dataFilter, setDataFilter] = useState(defaultValueFilterPart);
   useEffect(() => {
      setListPart(listPartFromStore);
   }, [listPartFromStore]);

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
   ];

   const handleClose = () => {
      onClose();
      resetData();
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
         {/*  filter by Order */}

         {/* show data Parts */}
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
                  rows={listPart}
                  rowBuffer={35}
                  rowThreshold={25}
                  columns={columns}
                  getRowId={(params) => params.modelCode}
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
      </Dialog>
   );
};

export { ProductDetailDialog };
