import commonApi from '@/api/common.api';
import { getFileNameFromPath, handleDownloadFile } from '@/utils/handleDownloadFile';
import { MenuItem } from '@mui/material';
import { GridToolbarExportContainer, useGridApiContext } from '@mui/x-data-grid-pro';

interface GridCsvExportMenuItemProps {
   hideMenu?: () => void;
   options?: any;
   optionsFilter?: any;
   currency?: string;
   modelType?: string;
}

const CsvExportToolbar: React.FC<GridCsvExportMenuItemProps> = (props) => {
   const apiRef = useGridApiContext();
   const { hideMenu, options, optionsFilter, modelType, currency, ...other } = props;

   const handleExport = async () => {
      const dataFilter = { modelType, optionsFilter: optionsFilter };
      const pathFile = await getExcelPathExported(dataFilter, currency);
      handleDownloadFile(getFileNameFromPath(pathFile), pathFile);

      getExcelPathExported;
      hideMenu?.();
   };

   return (
      <GridToolbarExportContainer>
         <MenuItem onClick={handleExport}>Export as Excel</MenuItem>
      </GridToolbarExportContainer>
   );
};

const getExcelPathExported = (optionsFilter, currency) => {
   return commonApi
      .exportTableToExcelFile(optionsFilter, { currency })
      .then((res) => {
         return JSON.parse(res.data).data;
      })
      .catch((error) => {
         console.log(error);
         return [];
      });
};

export default CsvExportToolbar;
