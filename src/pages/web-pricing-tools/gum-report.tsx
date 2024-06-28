//components
import { DataGridPro } from '@mui/x-data-grid-pro';
import { AppLayout } from '@/components';
import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { GridColumnGroupingModel } from '@mui/x-data-grid-pro';
import { CellText } from '@/components/DataTable/CellColor';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
//hooks
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
//apis
import gumApi from '@/api/gum.api';
//types
import { GetServerSidePropsContext } from 'next';
import { GridColDef } from '@mui/x-data-grid-pro';
//store
import { gumStore } from '@/store/reducers';
import { useDispatch, useSelector } from 'react-redux';
//libs
import _ from 'lodash';
//other
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { formatNumbericColumn } from '@/utils/columnProperties';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}
export function NumericCell({ value, type, fix = 1 }) {
   if (value == null || typeof value != 'number') return <span></span>;
   if (value < 0) {
      return (
         <span>
            {type == 'NUMERIC' && value && `(${-value.toFixed(fix)})`}
            {type == 'PERCENTAGE' && value && `(${-(value * 100).toFixed(fix)}%)`}
         </span>
      );
   }
   return (
      <span>
         {type == 'NUMERIC' && value && value.toFixed(fix)}
         {type == 'PERCENTAGE' && value && `${(value * 100).toFixed(fix)}%`}
      </span>
   );
}
interface StatsTableProps {
   rows: any[];
   header: GridColumnGroupingModel;
   columns: GridColDef<any>[];
}
function StatsTable({ rows, columns, header }: StatsTableProps) {
   return (
      <Grid item xs={4}>
         <DataGridPro
            sx={{ boxShadow: 1 }}
            hideFooter
            disableColumnMenu
            disableColumnFilter
            getRowClassName={params =>{if(params.row.segment == "Total Classes"){
               return " highlight-row ";}}}
            columnGroupingModel={header}
            rows={rows}
            rowHeight={38}
            columns={columns}
         />
      </Grid>
   );
}

export default function GumReport() {
   const { t } = useTranslation();
   const [segments, setSegments] = useState([]);
   const [regions, setRegions] = useState([]);
   const gumStats = useSelector(gumStore.selectStatsData);
   const dispatch = useDispatch();
   //handle change when filter by month
   const handleChangeDataFilter = (newMonth) => {
      const date = new Date(newMonth);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      dispatch(gumStore.actions.setDataFilter({ month, year }));
      dispatch(gumStore.sagaGetList());
   };
   useEffect(() => {
      dispatch(gumStore.actions.setDataFilter({ month: 4, year: 2023 }));
      dispatch(gumStore.sagaGetList());
      gumApi.getGroupingCriteria().then((rst) => {
         const { regions, segments } = rst?.data || {};
         setSegments(segments);
         setRegions(regions.filter((region) => region != 'China'));
      });
   }, []);

   //columns format
   const columns = ({
      type,
      fix = 2,
   }: {
      type: string;
      fix?: number;
   }): GridColDef<any[][number]>[] => [
      {
         field: 'segment',
         headerName: '',
         sortable: false,
         minWidth: 200,
         renderCell(params) {
            return <CellText value={params.row.segment} />;
         },
         flex: 0.5,
      },
      ...regions.map((region) => ({
         field: region,
         headerName: region,
         sortable: false,
         ...formatNumbericColumn,
         renderCell(params) {
            return <NumericCell value={params.row[region]} type={type} fix={fix} />;
         },
         minWidth: 100,
      })),
      {
         field: 'total',
         headerName: t('table.total'),
         sortable: false,
         ...formatNumbericColumn,
         renderCell(params) {
            const total = params.row['total'];
            return <NumericCell value={total} type={type} fix={fix} />;
         },
         minWidth: 100,
      },
   ];

   const tablesFormat = [
      {
         title: t('gumReport.bookingRevenue'),
         datafield: 'bookings-revenue',
         format: {
            type: 'NUMERIC',
         },
      },
      {
         title: t('gumReport.actualBookingRevenue'),
         datafield: 'actual-bookings-adj-revenue',
         format: {
            type: 'NUMERIC',
         },
      },
      {
         title: t('gumReport.bkgsAdjRevenue'),
         datafield: 'fav-unfav-bkgs-adj-revenue',
         format: {
            type: 'NUMERIC',
         },
      },
      {
         title: t('gumReport.bookingStdMargin'),
         datafield: 'booking-std-margin',
         format: {
            type: 'NUMERIC',
         },
      },
      {
         title: t('gumReport.actualBookingAdjMargin'),
         datafield: 'actual-bookings-adj-margin',
         format: {
            type: 'NUMERIC',
         },
      },
      {
         title: t('gumReport.bkgsAdjMargin'),
         datafield: 'fav-unfav-bkgs-adj-margin',
         format: {
            type: 'NUMERIC',
            fix: 1,
         },
      },
      {
         title: t('gumReport.actualBkingStdMargin'),
         datafield: 'actual-bkings-std-margin',
         format: {
            type: 'PERCENTAGE',
            displayBlankAsNull: true,
         },
      },
      {
         title: t('gumReport.actualBkingAdjMargin'),
         datafield: 'actual-bkings-adj-margin',
         format: {
            type: 'PERCENTAGE',
            displayBlankAsNull: true,
         },
      },
      {
         title: t('gumReport.YTDActualBooking'),
         datafield: 'YTD-actual-bookings',
         format: {
            type: 'NUMERIC',
            fix: 0,
            displayBlankAsNull: true,
         },
      },
   ];

   const columnGroupingModelList: GridColumnGroupingModel[] = tablesFormat.map(({ title }) => [
      {
         groupId: title,
         headerName: title,
         headerClassName: 'pricing-team',
         children: [...regions.map((region) => ({ field: region })), { field: 'total' }],
      },
   ]);
   // extract rows of all table from returned data
   const rowsList = tablesFormat.map(({ datafield ,format}) => {
      const rows = [];
      const totalRow = { id: segments.length, segment: 'Total Classes' };
      const nullValue = !format.displayBlankAsNull && 0;
      segments.forEach((segment, i) => {
         const row = { id: i, segment: segments[i] };
         regions.forEach((region) => {
            row[region] = gumStats?.[region]?.[segment]?.[datafield] ??nullValue ;
            row['total'] = gumStats?.['total']?.[segment]?.[datafield] ?? nullValue;
            totalRow[region] = gumStats?.[region]?.totalClasses?.[datafield] ?? nullValue;
         });
         totalRow['total'] = gumStats?.['total']?.totalClass?.[datafield] ?? nullValue;
         rows.push(row);
      });
      rows.push(totalRow);
      return rows;
   });
   const statsData = tablesFormat.map(({ title, format }, index) => ({
      columns: columns(format),
      rows: rowsList[index],
      header: columnGroupingModelList[index],
   }));
   return (
      <React.Fragment>
         <AppLayout entity="gumReport">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <DatePicker
                     onMonthChange={handleChangeDataFilter}
                     defaultValue={new Date(2023, 3)}
                     maxDate={new Date()}
                     minDate={new Date('2020-03-01')}
                     views={['year', 'month']}
                     label={t('filters.monthYear')}
                  />
               </Grid>
            </Grid>

            <Grid container spacing={2} alignItems={'center'} justifyContent={'center'}>
               {statsData.map((data) => (
                  <StatsTable {...data} />
               ))}
            </Grid>
         </AppLayout>
         <LogImportFailureDialog />
      </React.Fragment>
   );
}
