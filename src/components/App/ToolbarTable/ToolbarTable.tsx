import {
   GridToolbarColumnsButton,
   GridToolbarContainer,
   GridToolbarDensitySelector,
   GridToolbarExport,
   GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';

import CsvExportToolbar from './CsvExportMenu';

const ToolbarTable = (props) => {
   return (
      <GridToolbarContainer>
         <CsvExportToolbar optionsFilter={props?.optionsFilter} />
         <GridToolbarColumnsButton />
         <GridToolbarDensitySelector />
         <GridToolbarFilterButton />
      </GridToolbarContainer>
   );
};
export default ToolbarTable;
