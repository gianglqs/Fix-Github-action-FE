import { MenuItem } from '@mui/material';
import {
   GridToolbarExport,
   GridToolbarExportContainer,
   useGridApiContext,
} from '@mui/x-data-grid-pro';
import commonApi from '@/api/common.api';

interface GridCsvExportMenuItemProps {
   hideMenu?: () => void;
   options?: any;
   optionsFilter?: any;
}

const CsvExportToolbar: React.FC<GridCsvExportMenuItemProps> = (props) => {
   const apiRef = useGridApiContext();
   const { hideMenu, options, optionsFilter, ...other } = props;

   const handleExport = async () => {
      const dataFilter = { modelType: 'booking', optionsFilter: optionsFilter };
      console.log('click export ');
      const currentRowIds = apiRef.current.getAllRowIds();
      const allRows = await exportAllRows(dataFilter);
      console.log(allRows);

      apiRef.current.updateRows(allRows);
      await apiRef.current.exportDataAsCsv();
      const idsToDelete = allRows.map((row) => row.id).filter((id) => !currentRowIds.includes(id));
      apiRef.current.updateRows(idsToDelete.map((rowId) => ({ id: rowId, _action: 'delete' })));

      hideMenu?.();
   };

   return (
      <GridToolbarExportContainer>
         <MenuItem onClick={handleExport}>Export as CSV</MenuItem>
      </GridToolbarExportContainer>
   );
};

const exportAllRows = (optionsFilter) => {
   return commonApi
      .getAllDataForExport(optionsFilter, { currency: 'USD' })
      .then((res) => {
         const data = JSON.parse(res.data);
         return data.data.listOrder;
      })
      .catch((error) => {
         console.log(error);
         return [];
      });
};

export default CsvExportToolbar;
