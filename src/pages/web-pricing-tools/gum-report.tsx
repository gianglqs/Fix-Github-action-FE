//components
import { DataGridPro } from '@mui/x-data-grid-pro'
import { AppLayout } from '@/components';
import { Grid } from '@mui/material';
import TextField from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { GridColumnGroupingModel } from '@mui/x-data-grid-pro';
import AppAutocomplete from '@/components/App/Autocomplete';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
//hooks
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
//apis
import gumApi from '@/api/gum.api';
//types
import { GetServerSidePropsContext } from 'next';
import { GridColDef } from '@mui/x-data-grid-pro';
//libs
import _ from 'lodash';
//other
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await checkTokenBeforeLoadPage(context);
}
interface StatsTableProps {
  rows: any[];
  header: GridColumnGroupingModel;
  columns: GridColDef<any>[];
}
function StatsTable({rows,columns,header}: StatsTableProps) {
  return (
    <Grid item xs={6}>
    <DataGridPro
    columnGroupingModel={header}
    rows={rows}
    rowHeight={38}
    columns={columns}
  />
</Grid>
  )
}

export default function GumReport() {
  const { t } = useTranslation();
  const [segments, setSegments] = useState([]);
  const [regions,setRegions] = useState([]);
  const [gumStats,setGumStats] = useState({});
  const [filter,setFilter] = useState({
    year:null,
    month:null
  })
  const handleChangeDataFilter = (newMonth) =>{
    const date = new Date(newMonth);
    const month = date.getMonth() +1;
    const year = date.getFullYear();
    gumApi.getGumStats({
      month,
      year
    }).then((rst)=>{
      console.log('result gumstatsd la ',rst.data)
      setGumStats(rst?.data)
    });
    setFilter({
      year,
      month
    })
  }
 useEffect(()=>{
  gumApi.getGumColums().then(rst =>{
    console.log(rst);
    const {regions,segments} = rst?.data ||{} ;
    setSegments(segments);
    setRegions(regions.filter(region => region.value != "China"));
  })
 },[])
 const columns: GridColDef<(any[])[number]>[] = [
  {
    field: "segment",
    headerName: "",
    width:200,
  },...regions.map(region => ({
  field: region.value,
  headerName: region.value,
  width:200,
 })),
 {
  field: "total",
  headerName: "Total",
  width:200,
}
];
const tableTitles = [
  "Apr- YTD Actual Bookings",
  "Est. Bookings Revenue $M - At AOP 2024 Conditions",
  "Est. Bookings Std Margin $M - At AOP 2024 Conditions",
  "Est. Actual Bkings Std Margin % - At AOP 2024 Conditions",
  "Est. Actual Bookings Adj Revenue $M - Price and Cost adjusted",
  "Est. Actual Bookings Adj Margin $M - Price and Cost adjusted",
  "Est. Actual Bkings Adj Margin % - Price and Cost adjusted",
  "Fav/(Unfav) Bkgs Adj Revenue $M",
  "Fav/(Unfav) Bkgs Adj Margin $M"
]
const gumStatsResponseField = [
  "YTD-actual-bookings"	,
  "bookings-revenue"	,
  "booking-std-margin"	,
  "actual-bkings-std-margin"	,
  "actual-bookings-adj-revenue",
  "actual-bookings-adj-margin"	,
  "actual-bkings-adj-margin"	,
  "fav-unfav-bkgs-adj-margin"	,
  "fav-unfav-bkgs-adj-revenue"	,
]


const columnGroupingModelList: GridColumnGroupingModel[] = tableTitles.map(title => (  [{
  groupId: title,
  headerName: title,
  headerClassName: 'pricing-team',
  children: [...regions.map(region=>({field: region.value})),{field: "total"}],
}]));
const rowsList = gumStatsResponseField.map(stateField => {
  const rows = [];
segments.forEach((({value: segment},i) => {
const row = {id:i,segment:segments[i]?.value};
regions.forEach(({value:region}) =>{
row[region] = gumStats[region]?
gumStats[region][segment]?
gumStats[region][segment][stateField]?
gumStats[region][segment][stateField] :0 :0 :0 ;
})
rows.push(row);
}))
return rows;
})


const statsData = tableTitles.map((title,index) =>(({
columns,
rows: rowsList[index],
header: columnGroupingModelList[index]
})))
  return  <React.Fragment>
    <AppLayout entity="gumReport">
    <Grid container spacing={1} sx={{ marginBottom: 2 }}>
        <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
        <DatePicker
        onMonthChange={handleChangeDataFilter}
        defaultValue={new Date()}
        maxDate={new Date()}
        minDate={new Date('2020-03-01')}
        views={['year', 'month']} label="Basic date picker" />
        </Grid>
        </Grid>
        
<Grid container spacing={2} alignItems={"center"} justifyContent={'center'}>
  {
    statsData.map((data) =><StatsTable {...data}/>
    )
    
  }
</Grid>
    </AppLayout>
    <LogImportFailureDialog />
 </React.Fragment>;
  
}

