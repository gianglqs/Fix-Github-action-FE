import { Dialog, Grid } from '@mui/material';
import { DataTable } from '@/components/DataTable';
import DeleteIcon from '@mui/icons-material/Delete';
import DifferenceIcon from '@mui/icons-material/Difference';
import marginAnalysisApi from '@/api/marginAnalysis.api';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';

export default function MarginHistoryDialog(props) {
   const { open, onClose, data, handleOnRowClick, loadHistoryMargin } = props;
   const dispatch = useDispatch();

   const columns = [
      {
         field: 'quoteNumber',
         flex: 0.5,
         headerName: 'Quote Number',
      },
      {
         field: 'type',
         flex: 0.5,
         headerName: '#',
      },
      {
         field: 'modelCode',
         flex: 0.5,
         headerName: 'Model Code',
      },
      {
         field: 'series',
         flex: 0.5,
         headerName: 'Series',
      },
      {
         field: 'currency',
         flex: 0.5,
         headerName: 'Currency',
      },
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
      },
      {
         field: 'additionalDiscountPercentage',
         flex: 0.5,
         headerName: 'Additional Discount',
      },
      {
         field: 'choose',
         flex: 0.25,
         headerName: '',
         align: 'center',
         renderCell(params) {
            return (
               <span>
                  <DifferenceIcon
                     sx={{ fill: 'black' }}
                     onClick={() => handleOnCellClick(params)}
                  />
               </span>
            );
         },
      },
      {
         field: 'delete',
         flex: 0.25,
         headerName: '',
         align: 'center',
         renderCell(params) {
            return (
               <span>
                  <DeleteIcon sx={{ fill: 'red' }} onClick={() => handleClickDelete(params)} />
               </span>
            );
         },
      },
   ];

   const handleClickDelete = async (params) => {
      const transformedData = {
         quoteNumber: params.row.quoteNumber,
         type: params.row.type,
         modelCode: params.row.modelCode,
         series: params.row.series,
         currency: params.row.currency,
         region: params.row.region,
         additionalDiscountPercentage: params.row.additionalDiscountPercentage,
      };

      await marginAnalysisApi
         .deleteMarginData(transformedData)
         .then(() => {
            dispatch(commonStore.actions.setSuccessMessage('Deleted'));
            loadHistoryMargin();
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const getRowId = (row) => {
      const quoteNumber = String(row.quoteNumber);
      const type = String(row.type);
      const modelCode = String(row.modelCode);
      const series = String(row.partNumber);
      const currency = String(row.currency);
      const region = String(row.region);
      const additionalDiscountPercentage = String(row.additionalDiscountPercentage);

      return (
         quoteNumber + type + modelCode + series + currency + region + additionalDiscountPercentage
      );
   };

   const handleOnCellClick = (params) => {
      const data = {
         quoteNumber: params.row.quoteNumber,
         type: params.row.type,
         modelCode: params.row.modelCode,
         series: params.row.series,
         currency: params.row.currency,
         region: params.row.region,
         additionalDiscountPercentage: params.row.additionalDiscountPercentage,
      };
      handleOnRowClick(data);
      onClose();
   };
   return (
      <Dialog maxWidth="lg" open={open} onClose={onClose}>
         <Grid container spacing={1} sx={{ padding: 2, height: '50vh', width: '50vw' }}>
            <DataTable
               hideFooter
               disableColumnMenu
               rowHeight={50}
               rows={data}
               columns={columns}
               getRowId={getRowId}
               sx={{ borderBottom: '1px solid #a8a8a8', borderTop: '1px solid #a8a8a8' }}
            />
         </Grid>
      </Dialog>
   );
}
