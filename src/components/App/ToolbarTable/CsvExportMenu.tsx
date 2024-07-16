import commonApi from '@/api/exportTable.api';
import { commonStore } from '@/store/reducers';
import { getFileNameFromPath, handleDownloadFile } from '@/utils/handleDownloadFile';
import { MenuItem } from '@mui/material';
import { GridToolbarExportContainer } from '@mui/x-data-grid-pro';
import { useDispatch } from 'react-redux';

interface GridCsvExportMenuItemProps {
   hideMenu?: () => void;
   options?: any;
   optionsFilter?: any;
   currency?: string;
   modelType?: string;
}

const CsvExportToolbar: React.FC<GridCsvExportMenuItemProps> = (props) => {
   const dispatch = useDispatch();
   const { hideMenu, optionsFilter, modelType, currency } = props;

   const handleExport = async () => {
      const dataFilter =
         modelType === 'volume-discount-analysis'
            ? { modelType, volumeDiscountRequest: optionsFilter, optionsFilter: { currency } }
            : { modelType, optionsFilter: optionsFilter };
      if (modelType === 'simulation-modeling') {
         commonApi
            .exportSimulationModelingTableToExcelFile(optionsFilter)
            .then((res) => {
               console.log(res.data);
               const pathFile = res.data.data;
               handleDownloadFile(getFileNameFromPath(pathFile), pathFile);
            })
            .catch((error) => {
               console.log(error);
               dispatch(commonStore.actions.setErrorMessage(error.message));
            });
      } else {
         commonApi
            .exportTableToExcelFile(dataFilter, { currency })
            .then((res) => {
               const pathFile = JSON.parse(res.data).data;
               handleDownloadFile(getFileNameFromPath(pathFile), pathFile);
            })
            .catch((error) => {
               dispatch(commonStore.actions.setErrorMessage(error.message));
            });
      }

      hideMenu?.();
   };

   return (
      <GridToolbarExportContainer>
         <MenuItem onClick={handleExport}>Export as Excel</MenuItem>
      </GridToolbarExportContainer>
   );
};

export default CsvExportToolbar;
