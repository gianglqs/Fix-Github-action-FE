import {
   GridToolbarColumnsButton,
   GridToolbarContainer,
   GridToolbarDensitySelector,
   GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';

import CsvExportToolbar from './CsvExportMenu';

const ToolbarTable = (props) => {
   return (
      <GridToolbarContainer>
         <GridToolbarColumnsButton />
         <GridToolbarDensitySelector />
         <GridToolbarFilterButton />
         <CsvExportToolbar {...props} />
      </GridToolbarContainer>
   );
};
export default ToolbarTable;
