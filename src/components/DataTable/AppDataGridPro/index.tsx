import ToolbarTable from '@/components/App/ToolbarTable/ToolbarTable';
import { DataGridPro, DataGridProProps } from '@mui/x-data-grid-pro';

export interface DataTableProps extends DataGridProProps {
   tableHeight?: number | string;
   hideFooter?: boolean;
   page?: number;
   perPage?: number;
   totalItems?: number;
   showToolbar?: boolean;
   entity?: string;
   onChangePage?(page: number): void;
   onChangePerPage?(perPage: number): void;
   dataFilter?: any;
   currency?: string;
   onCellClick?: () => void;
   getRowId?: () => any;
}

const AppDataTable: React.FC<any> = (props) => {
   const {
      tableHeight,
      hideFooter,
      entity,
      page,
      showToolbar,
      perPage,
      totalItems,
      selectionModel,
      autoHeight,
      onChangePage,
      onChangePerPage,
      currency,
      dataFilter,
      onCellClick,
      getRowId,
      ...rest
   } = props;

   return (
      <DataGridPro
         hideFooter
         disableColumnMenu
         sx={{
            '& .MuiDataGrid-columnHeaderTitle': {
               whiteSpace: 'break-spaces',
               lineHeight: 1.2,
            },
         }}
         columnHeaderHeight={90}
         rowHeight={30}
         slots={{
            toolbar: () => (
               <ToolbarTable optionsFilter={dataFilter} currency={currency} modelType={entity} />
            ),
         }}
         rowBufferPx={35}
         getRowId={getRowId}
         onCellClick={onCellClick}
         {...rest}
      />
   );
};

export default AppDataTable;
