import { AppSearchBar } from '@/components/App';
import { DataTable, DataTablePagination } from '@/components/DataTable';
import { importFailureStore } from '@/store/reducers';
import { centerColumn, centerHeaderColumn } from '@/utils/columnProperties';
import { Button, ButtonProps, Dialog, Grid, Paper, Typography } from '@mui/material';
import {
   GridCsvExportMenuItem,
   GridCsvExportOptions,
   GridToolbarColumnsButton,
   GridToolbarContainer,
   GridToolbarDensitySelector,
   GridToolbarExportContainer,
   GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';
import { createAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const LogImportFailureDialog: React.FC<any> = (props) => {
   const dispatch = useDispatch();
   const router = useRouter();

   const entityApp = 'importFailure';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);

   useEffect(() => {
      dispatch(getListAction());
   }, [getListAction, router.query]);

   useEffect(() => {
      return () => {
         dispatch(resetStateAction());
      };
   }, [router.pathname]);

   const importFailureState = useSelector(importFailureStore.selectImportFailureDialogState);
   const { search, fileUUID } = useSelector(importFailureStore.selectDataFilter);
   const { open, overview } = importFailureState;

   const listImportFailure = useSelector(importFailureStore.selectImportFailureList);
   const tableState = useSelector(importFailureStore.selectTableState);

   let heightTable = 415;

   const handleChangePage = (pageNo: number) => {
      dispatch(importFailureStore.actions.setTableState({ pageNo }));
      dispatch(importFailureStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(importFailureStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const onClose = () => {
      dispatch(
         importFailureStore.actions.setImportFailureDialogState({
            open: false,
         })
      );
   };

   const columns = [
      {
         field: 'primaryKey',
         flex: 0.2,
         headerName: 'Primary Key',
         ...centerHeaderColumn,
      },

      {
         field: 'type',
         flex: 0.1,
         headerName: 'Type',
         ...centerColumn,
         renderCell(params) {
            return (
               <Button
                  variant="outlined"
                  color={`${params.row.type === 'error' ? 'error' : 'warning'}`}
               >
                  {params.row.type === 'error' ? 'error' : 'warning'}
               </Button>
            );
         },
      },
      {
         field: 'reason',
         flex: 0.9,
         headerName: 'Reason',
         ...centerHeaderColumn,
      },
   ];

   const handleClose = () => {
      onClose();
      setTimeout(resetData, 500);
   };

   // reset when CLOSE dialog
   const resetData = () => {
      dispatch(importFailureStore.resetState());
   };

   const handleSearch = async (event, searchQuery) => {
      dispatch(importFailureStore.actions.setDataFilter({ fileUUID, search: searchQuery }));
      handleChangePage(1);
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
            <Grid
               container
               sx={{
                  padding: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
               }}
            >
               <AppSearchBar onSearch={handleSearch} placeholder={'search'} />
               <Typography>{overview}</Typography>
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
                           toolbar: CustomToolbar,
                        }}
                        rows={listImportFailure}
                        rowBuffer={35}
                        rowThreshold={25}
                        columns={columns}
                        checkboxSelection
                        getRowId={(params) => params.id}
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
            </Grid>
         </Grid>
      </Dialog>
   );
};

const csvOptions: GridCsvExportOptions = { delimiter: ';' };

function CustomExportButton(props: ButtonProps) {
   return (
      <GridToolbarExportContainer {...props}>
         <GridCsvExportMenuItem options={csvOptions} />
      </GridToolbarExportContainer>
   );
}

const CustomToolbar = () => (
   <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      {/* <GridToolbarDensitySelector /> */}
      <CustomExportButton />
   </GridToolbarContainer>
);
