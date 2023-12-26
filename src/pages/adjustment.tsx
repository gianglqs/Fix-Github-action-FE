import { useCallback, useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage, formatDate } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { adjustmentStore, commonStore } from '@/store/reducers';

import { rowColor } from '@/theme/colorRow';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';

import {
   AppAutocomplete,
   AppDateField,
   AppLayout,
   AppTextField,
   DataTablePagination,
} from '@/components';

import _ from 'lodash';
import { produce } from 'immer';

import {
   defaultValueFilterOrder,
   defaultValueCaculatorForAjustmentCost,
} from '@/utils/defaultValues';
import { DataGridPro, GridCellParams, GridToolbar } from '@mui/x-data-grid-pro';
import axios from 'axios';
import { parseCookies } from 'nookies';
import CellColor, {
   CellPercentageColor,
   CellText,
   NoneAdjustValueCell,
} from '@/components/DataTable/CellColor';
import blendColor from '@/utils/blendColor';
import { makeStyles } from '@mui/styles';

export async function getServerSideProps(context) {
   try {
      let cookies = parseCookies(context);
      let token = cookies['token'];
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkToken`, null, {
         headers: {
            Authorization: 'Bearer ' + token,
         },
      });

      return {
         props: {},
      };
   } catch (error) {
      console.error('token error', error);

      return {
         redirect: {
            destination: '/login',
            permanent: false,
         },
      };
   }
}
const resetPaddingCell = makeStyles({
   '& .MuiDataGrid-cell': {
      padding: 0,
   },
   '& .css-1ey3qrw-MuiDataGrid-root': {
      padding: 0,
   },
});

export default function Adjustment() {
   const dispatch = useDispatch();
   const listAdjustment = useSelector(adjustmentStore.selectAdjustmentList);
   const initDataFilter = useSelector(adjustmentStore.selectInitDataFilter);
   const listTotalRow = useSelector(adjustmentStore.selectTotalRow);

   const [dataFilter, setDataFilter] = useState(defaultValueFilterOrder);
   const [dataCalculator, setDataCalculator] = useState(defaultValueCaculatorForAjustmentCost);
   const currentPage = useSelector(commonStore.selectTableState).pageNo;

   const [costAdjColor, setCostAdjColor] = useState(null);
   const [freightAdjColor, setFreightAdjColor] = useState(null);
   const [fxAdjColor, setFxAdjColor] = useState(null);
   const [dnAdjColor, setDnAdjColor] = useState(null);
   const [totalColor, setTotalColor] = useState(null);

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (
               _.includes(
                  ['orderNo', 'fromDate', 'toDate', 'marginPercentage', 'marginPercentageAfterAdj'],
                  field
               )
            ) {
               draft[field] = option;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   const handleChangeDataCalculator = (option, field) => {
      setDataCalculator((prev) =>
         produce(prev, (draft) => {
            draft[field] = option;
         })
      );
   };

   const handleCalculator = () => {
      dispatch(adjustmentStore.actions.setDefaultValueCalculator(dataCalculator));
      changeColorColumnWhenAdjChange();
      handleChangePage(currentPage);
   };

   const handleFilterAdjustment = () => {
      dispatch(adjustmentStore.actions.setDefaultValueFilterAdjustment(dataFilter));

      handleChangePage(1);
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(adjustmentStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const tableState = useSelector(commonStore.selectTableState);

   const columns = [
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
         renderCell(params) {
            return <CellText value={params.row.region} />;
         },
      },

      {
         field: 'Plant',
         flex: 0.6,
         headerName: 'Plant',
         renderCell(params) {
            return <CellText value={params.row.plant} />;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: 'Class',
         renderCell(params) {
            return <CellText value={params.row.clazz} />;
         },
      },
      {
         field: 'series',
         flex: 0.4,
         headerName: 'Series',
         renderCell(params) {
            return <CellText value={params.row.metaSeries} />;
         },
      },
      {
         field: 'model',
         flex: 0.6,
         headerName: 'Models',
         renderCell(params) {
            return <CellText value={params.row.model} />;
         },
      },
      {
         field: 'noOfOrder',
         flex: 0.3,
         headerName: 'No of Orders',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <NoneAdjustValueCell color={''} value={params?.row.noOfOrder}></NoneAdjustValueCell>
            );
         },
      },
      {
         field: 'additionalVolume',
         flex: 0.5,
         headerName: 'Additional Volume at BEP For Discount',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <NoneAdjustValueCell
                  color={totalColor}
                  value={params?.row.additionalVolume}
               ></NoneAdjustValueCell>
            );
         },
      },
      {
         field: 'manualAdjCost',
         flex: 0.8,
         headerName: "Adjusted Cost ('000 USD)",
         ...formatNumbericColumn,
         backgroundColor: costAdjColor,
         renderCell(params) {
            return <CellColor color={costAdjColor} value={params?.row.manualAdjCost}></CellColor>;
         },
      },
      {
         field: 'manualAdjFreight',
         flex: 0.8,
         headerName: "Adjusted Freight ('000 USD)",
         ...formatNumbericColumn,
         padding: 0,
         backgroundColor: freightAdjColor,
         renderCell(params) {
            return (
               <CellColor color={freightAdjColor} value={params?.row.manualAdjFreight}></CellColor>
            );
         },
      },
      {
         field: 'manualAdjFX',
         flex: 0.7,
         headerName: "Adjusted FX ('000 USD)",
         ...formatNumbericColumn,
         backgroundColor: fxAdjColor,
         renderCell(params) {
            return <CellColor color={fxAdjColor} value={params?.row.manualAdjFX}></CellColor>;
         },
      },

      {
         field: 'totalManualAdjCost',
         flex: 0.6,
         headerName: "Total Manual Adj Cost ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <CellColor color={totalColor} value={params?.row.totalManualAdjCost}></CellColor>
            );
         },
      },

      {
         field: 'originalDN',
         flex: 0.7,
         headerName: "Original DN ('000 USD)",
         ...formatNumbericColumn,

         renderCell(params) {
            return <CellColor color={''} value={params?.row.originalDN}></CellColor>;
         },
      },
      {
         field: 'originalMargin',
         flex: 0.7,
         headerName: "Original Margin $ ('000 USD)",
         ...formatNumbericColumn,

         renderCell(params) {
            return <CellColor color={''} value={params?.row.originalMargin}></CellColor>;
         },
      },
      {
         field: 'originalMarginPercentage',
         flex: 0.7,
         headerName: 'Original Margin %',
         ...formatNumbericColumn,

         renderCell(params) {
            return (
               <CellColor color={''} value={params?.row.originalMarginPercentage * 100}></CellColor>
            );
         },
      },

      {
         field: 'newDN',
         flex: 0.6,
         headerName: "Adjusted Dealer Net ('000 USD)",
         ...formatNumbericColumn,
         renderCell(params) {
            return <CellColor color={dnAdjColor} value={params?.row.newDN}></CellColor>;
         },
      },
      {
         field: 'newMargin',
         flex: 0.6,
         headerName: "New margin $ ('000 USD) After manual Adj",
         ...formatNumbericColumn,
         renderCell(params) {
            return <CellColor color={totalColor} value={params?.row.newMargin}></CellColor>;
         },
      },
      {
         field: 'newMarginPercentage',
         flex: 0.6,
         headerName: 'New margin % After manual Adj',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <CellPercentageColor
                  color={totalColor}
                  value={params?.row.newMarginPercentage * 100}
               ></CellPercentageColor>
            );
         },
      },
   ];

   const totalColumns = [
      {
         field: 'region',
         flex: 0.5,
         headerName: 'Region',
         renderCell(params) {
            return <span>Total</span>;
         },
      },

      {
         field: 'Plant',
         flex: 0.6,
         headerName: 'Plant',
         renderCell(params) {
            return <span></span>;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         headerName: 'Class',
         renderCell(params) {
            return <span>{params.row.clazz}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.4,
         headerName: 'Series',
         renderCell(params) {
            return <span>{params.row.metaSeries}</span>;
         },
      },
      {
         field: 'model',
         flex: 0.6,
         headerName: 'Models',
         renderCell(params) {
            return <span>{params.row.model}</span>;
         },
      },
      {
         field: 'noOfOrder',
         flex: 0.3,
         headerName: 'No of Orders',
         ...formatNumbericColumn,
      },
      {
         field: 'additionalVolume',
         flex: 0.5,
         headerName: 'Additional Volume at BEP For Discount',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params?.row.additionalVolume}</span>;
         },
      },
      {
         field: 'manualAdjCost',
         flex: 0.8,
         headerName: 'Adjusted Cost',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.manualAdjCost)}</span>;
         },
      },
      {
         field: 'manualAdjFreight',
         flex: 0.8,
         headerName: 'Adjusted Freight',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.manualAdjFreight)}</span>;
         },
      },
      {
         field: 'manualAdjFX',
         flex: 0.7,
         headerName: 'Adjusted FX',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.manualAdjFX)}</span>;
         },
      },

      {
         field: 'totalManualAdjCost',
         flex: 0.6,
         headerName: 'Total Manual Adj Cost',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.totalManualAdjCost)}</span>;
         },
      },

      {
         field: 'originalDN',
         flex: 0.7,
         headerName: 'Original DN',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.originalDN)}</span>;
         },
      },
      {
         field: 'originalMargin',
         flex: 0.7,
         headerName: 'Original Margin $',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.originalMargin)}</span>;
         },
      },
      {
         field: 'originalMarginPercentage',
         flex: 0.7,
         headerName: 'Original Margin %',
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <span>{formatNumberPercentage(params?.row.originalMarginPercentage * 100)}</span>
            );
         },
      },

      {
         field: 'newDN',
         flex: 0.6,
         headerName: 'Adjusted Dealer Net',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newDN)}</span>;
         },
      },
      {
         field: 'newMargin',
         flex: 0.6,
         headerName: 'New margin $ (USD) After manual Adj',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params?.row.newMargin)}</span>;
         },
      },
      {
         field: 'newMarginPercentage',
         flex: 0.6,
         headerName: 'New margin % After manual Adj',
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params?.row.newMarginPercentage * 100)}</span>;
         },
      },
   ];

   // changes highlighted when I adjust a variant

   const [listColor, setListColor] = useState([]);

   let costAdjOld;
   let freightAdjOld;
   let fxAdjOld;
   let dnAdjOld;

   function changeColorColumnWhenAdjChange() {
      let n = 0;
      //costAdj
      if (
         dataCalculator.costAdjPercentage === '' ||
         Number(dataCalculator.costAdjPercentage) === 0
      ) {
         setCostAdjColor('');
      } else if (dataCalculator.costAdjPercentage !== costAdjOld) {
         //when adjust costAdjPercentage
         setCostAdjColor('#FFB972');
         setTotalColor('#FFB972');
         n++;
      }

      //freightAdj
      if (dataCalculator.freightAdj === '' || Number(dataCalculator.freightAdj) === 0) {
         setFreightAdjColor('');
      } else if (dataCalculator.freightAdj !== freightAdjOld) {
         //when adjust costAdjPercentage
         setFreightAdjColor('#F5A785');
         setTotalColor('#F5A785');
         n++;
      }

      //FXAdj
      if (dataCalculator.fxAdj === '' || Number(dataCalculator.fxAdj) === 0) {
         setFxAdjColor('');
      } else if (dataCalculator.fxAdj !== fxAdjOld) {
         //when adjust costAdjPercentage
         setFxAdjColor('#CDBDB0');
         setTotalColor('#CDBDB0');
         n++;
      }

      //dnAdjPercentage
      if (dataCalculator.dnAdjPercentage === '' || Number(dataCalculator.dnAdjPercentage) === 0) {
         setDnAdjColor('');
      } else if (dataCalculator.dnAdjPercentage !== dnAdjOld) {
         //when adjust costAdjPercentage
         setDnAdjColor('#DFB95E');
         setTotalColor('#DFB95E');
         n++;
      }
      if (n > 1) setTotalColor('#D09903');
   }

   const isZeroOrEmpty = (number: string) => {
      return number === '' || Number(number) === 0;
   };

   useEffect(() => {
      let n = 0;
      //costAdj
      if (
         dataCalculator.costAdjPercentage !== costAdjOld &&
         !isZeroOrEmpty(dataCalculator.costAdjPercentage)
      ) {
         n++;
         setCostAdjColor('#FFCC99');
         setTotalColor('#FFCC99');
         costAdjOld = dataCalculator.costAdjPercentage;
      }
      if (
         dataCalculator.freightAdj !== freightAdjOld &&
         !isZeroOrEmpty(dataCalculator.freightAdj)
      ) {
         n++;
         setFreightAdjColor('#f7c0a9');
         setTotalColor('#f7c0a9');
         dnAdjOld = dataCalculator.freightAdj;
      }
      if (dataCalculator.fxAdj !== fxAdjOld && !isZeroOrEmpty(dataCalculator.fxAdj)) {
         n++;
         setFxAdjColor('#e9d4c4');
         setTotalColor('#e9d4c4');
         fxAdjOld = dataCalculator.fxAdj;
      }
      if (
         dataCalculator.dnAdjPercentage !== dnAdjOld &&
         !isZeroOrEmpty(dataCalculator.dnAdjPercentage)
      ) {
         n++;
         setDnAdjColor('#f9d06d');
         setTotalColor('#f9d06d');
         dnAdjOld = dataCalculator.dnAdjPercentage;
      }
      //
      if (n > 1) setTotalColor('#FFC72C');
      else if (n === 0) setTotalColor('');
      console.log(costAdjOld);
   }, [costAdjColor, freightAdjColor, fxAdjColor, dnAdjColor]);

   const cellStyle = resetPaddingCell();

   return (
      <>
         <AppLayout entity="adjustment">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.regions}
                     label="Region"
                     onChange={(e, option) => handleChangeDataFilter(option, 'regions')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.plants}
                     label="Plant"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'plants')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.metaSeries}
                     label="MetaSeries"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'metaSeries')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.dealers}
                     label="Dealer"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'dealers')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.classes}
                     label="Class"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'classes')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.models}
                     label="Model"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'models')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.segments}
                     label="Segment"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'segments')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.marginPercentageGroup}
                     label="Margin %"
                     onChange={(e, option) =>
                        handleChangeDataFilter(
                           _.isNil(option) ? '' : option?.value,
                           'marginPercentage'
                        )
                     }
                     disableClearable={false}
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.marginPercentageGroup}
                     label="New Margin %"
                     onChange={(e, option) =>
                        handleChangeDataFilter(
                           _.isNil(option) ? '' : option?.value,
                           'marginPercentageAfterAdj'
                        )
                     }
                     disableClearable={false}
                     primaryKeyOption="value"
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={6}>
                  <Grid item xs={4}>
                     <Button
                        variant="contained"
                        onClick={handleFilterAdjustment}
                        sx={{ width: '100%', height: 24 }}
                     >
                        Filter
                     </Button>
                  </Grid>
               </Grid>
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppTextField
                        sx={{ backgroundColor: '#FFCC99' }}
                        onChange={(e) =>
                           handleChangeDataCalculator(e.target.value, 'costAdjPercentage')
                        }
                        name="costAdjPercentage"
                        label="Cost Adj %"
                        placeholder="Cost Adj %"
                     />
                  </Grid>
               </Grid>
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppTextField
                        sx={{ backgroundColor: '#f7c0a9' }}
                        onChange={(e) => handleChangeDataCalculator(e.target.value, 'freightAdj')}
                        name="freightAdj"
                        label="Freight Adj ('000 USD)"
                        placeholder="Freight Adj ('000 USD)"
                     />
                  </Grid>
               </Grid>{' '}
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppTextField
                        sx={{ backgroundColor: '#e9d4c4' }}
                        onChange={(e) => handleChangeDataCalculator(e.target.value, 'fxAdj')}
                        name="fxAdj"
                        label="FX Adj ('000 USD)"
                        placeholder="FX Adj ('000 USD)"
                     />
                  </Grid>
               </Grid>{' '}
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppTextField
                        sx={{ backgroundColor: '#f9d06d' }}
                        onChange={(e) =>
                           handleChangeDataCalculator(e.target.value, 'dnAdjPercentage')
                        }
                        name="dnAdjPercentage"
                        label="DN Adj %"
                        placeholder="DN Adj %"
                     />
                  </Grid>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleCalculator}
                     sx={{ width: '100%', height: 24 }}
                  >
                     Calculate
                  </Button>
               </Grid>
            </Grid>

            <Paper elevation={1} sx={{ marginTop: 2 }}>
               <Grid container sx={{ height: 'calc(100vh - 263px)' }}>
                  <DataGridPro
                     //className={`${cellStyle['& .MuiDataGrid-cell']} ${cellStyle['& .css-1ey3qrw-MuiDataGrid-root']}`}
                     sx={{
                        '& .MuiDataGrid-cell': {
                           padding: 0,
                        },
                        '& .css-1ey3qrw-MuiDataGrid-root': {
                           padding: 0,
                        },
                     }}
                     hideFooter
                     disableColumnMenu
                     //tableHeight={740}
                     rowHeight={30}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rows={listAdjustment}
                     rowBuffer={35}
                     rowThreshold={25}
                     columns={columns}
                     getRowId={(params) => params.id}
                  />
               </Grid>
               <DataGridPro
                  sx={rowColor}
                  getCellClassName={(params: GridCellParams<any, any, number>) => {
                     return 'total';
                  }}
                  hideFooter
                  columnHeaderHeight={0}
                  disableColumnMenu
                  rowHeight={30}
                  rows={listTotalRow}
                  rowBuffer={35}
                  rowThreshold={25}
                  columns={totalColumns}
                  getRowId={(params) => params.id}
               />
               <DataTablePagination
                  page={tableState.pageNo}
                  perPage={tableState.perPage}
                  totalItems={tableState.totalItems}
                  onChangePage={handleChangePage}
                  onChangePerPage={handleChangePerPage}
               />
            </Paper>
         </AppLayout>
      </>
   );
}
