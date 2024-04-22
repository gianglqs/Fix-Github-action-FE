import { Dialog, Grid } from '@mui/material';
import { DataTable } from '@/components/DataTable';

export default function MarginHistoryDialog(props) {
   const { open, onClose, data, handleOnRowClick } = props;

   const columns = [
      {
         field: 'quoteNumber',
         flex: 0.5,
         headerName: 'Quote Number',
      },
      {
         field: 'type',
         flex: 0.5,
         headerName: 'Type',
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
   ];

   const getRowId = (row) => {
      const quoteNumber = String(row.quoteNumber);
      const type = String(row.type);
      const modelCode = String(row.modelCode);
      const series = String(row.partNumber);
      const currency = String(row.currency);
      const region = String(row.region);

      return quoteNumber + type + modelCode + series + currency + region;
   };

   const handleOnCellClick = (params, event) => {
      event.stopPropagation();
      const data = {
         quoteNumber: params.row.quoteNumber,
         type: params.row.type,
         modelCode: params.row.modelCode,
         series: params.row.series,
         currency: params.row.currency,
         region: params.row.region,
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
               onCellClick={handleOnCellClick}
            />
         </Grid>
      </Dialog>
   );
}
