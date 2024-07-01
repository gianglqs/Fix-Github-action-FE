import { useEffect, useState } from 'react';

import { formatNumbericColumn } from '@/utils/columnProperties';
import { formatNumber, formatNumberPercentage, formatDate } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';
import { adjustmentStore, commonStore } from '@/store/reducers';

import moment from 'moment-timezone';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Button, Typography } from '@mui/material';

import {
   AppAutocomplete,
   AppLayout,
   AppNumberField,
   AppTextField,
   AppDateField,
   DataTablePagination,
} from '@/components';

import _ from 'lodash';
import { produce } from 'immer';

import {
   defaultValueFilterOrder,
   defaultValueCaculatorForAjustmentCost,
} from '@/utils/defaultValues';
import {
   DataGridPro,
   GridCellParams,
   GridToolbar,
   GridColumnGroupingModel,
} from '@mui/x-data-grid-pro';

import CellColor, {
   CellPercentageColor,
   CellText,
   NoneAdjustValueCell,
} from '@/components/DataTable/CellColor';
import { makeStyles } from '@mui/styles';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import AppBackDrop from '@/components/App/BackDrop';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { setCookie } from 'nookies';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { paperStyle } from '@/theme/paperStyle';
import { useTranslation } from 'react-i18next';
import AppDataTable from '@/components/DataTable/AppDataGridPro';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
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
   const { t } = useTranslation();

   const listAdjustment = useSelector(adjustmentStore.selectAdjustmentList);
   const initDataFilter = useSelector(adjustmentStore.selectInitDataFilter);
   const listTotalRow = useSelector(adjustmentStore.selectTotalRow);

   const cacheDataFilter = useSelector(adjustmentStore.selectDataFilter);
   const cacheDataCalculator = useSelector(adjustmentStore.selectDataAdjustment);
   const [dataFilter, setDataFilter] = useState(cacheDataFilter);

   const [dataCalculator, setDataCalculator] = useState(cacheDataCalculator);
   const currentPage = useSelector(commonStore.selectTableState).pageNo;

   const [costAdjColor, setCostAdjColor] = useState(null);
   const [freightAdjColor, setFreightAdjColor] = useState(null);
   const [fxAdjColor, setFxAdjColor] = useState(null);
   const [dnAdjColor, setDnAdjColor] = useState(null);
   const [totalColor, setTotalColor] = useState(null);

   const loadingTable = useSelector(adjustmentStore.selectLoadingData);
   const [hasSetDataFilter, setHasSetDataFilter] = useState(false);
   const [hasSetDataCalculator, setHasSetDataCalculator] = useState(false);
   const serverTimeZone = useSelector(adjustmentStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(adjustmentStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(adjustmentStore.selectLastUpdatedBy);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (
               _.includes(
                  ['fromDate', 'toDate', 'marginPercentage', 'marginPercentageAfterAdj'],
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

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            setCookie(null, 'adjustmentFilter', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterAdjustment();
         }
      }, 700);

      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   useEffect(() => {
      if (!hasSetDataFilter && cacheDataFilter) {
         setDataFilter(cacheDataFilter);

         setHasSetDataFilter(true);
      }
   }, [cacheDataFilter]);

   useEffect(() => {
      if (!hasSetDataCalculator && cacheDataCalculator) {
         setDataCalculator(cacheDataCalculator);

         setHasSetDataCalculator(true);
      }
   }, [cacheDataCalculator]);

   useEffect(() => {
      const debouncedHandleWhenChangeDataCalculator = _.debounce(() => {
         if (!isEmptyObject(dataCalculator) && dataCalculator != cacheDataCalculator) {
            setCookie(null, 'adjustmentCalculator', JSON.stringify(dataCalculator), {
               maxAge: 604800,
               path: '/',
            });
            handleCalculator();
         }
      }, 700);

      debouncedHandleWhenChangeDataCalculator();

      return () => debouncedHandleWhenChangeDataCalculator.cancel();
   }, [dataCalculator]);

   const handleCalculator = () => {
      const isSelectedFilter =
         dataCalculator.costAdjPercentage ||
         dataCalculator.dnAdjPercentage ||
         dataCalculator.freightAdj ||
         dataCalculator.fxAdj;
      if (isSelectedFilter) {
         dispatch(adjustmentStore.actions.setDefaultValueCalculator(dataCalculator));
         changeColorColumnWhenAdjChange();
         handleChangePage(currentPage);
      }
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
         minWidth: 60,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.region}</span>;
         },
      },

      {
         field: 'Plant',
         flex: 0.5,
         minWidth: 60,
         headerName: t('table.plant'),
         renderCell(params) {
            return <CellText value={params.row.plant} />;
         },
      },
      {
         field: 'truckClass',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.class'),
         renderCell(params) {
            return <CellText value={params.row.clazz} />;
         },
      },
      {
         field: 'series',
         flex: 0.5,
         minWidth: 60,
         headerName: t('table.series'),
         renderCell(params) {
            return <CellText value={params.row.series.series} />;
         },
      },
      {
         field: 'model',
         flex: 0.6,
         minWidth: 70,
         headerName: t('table.models'),
         renderCell(params) {
            return <CellText value={params.row.model} />;
         },
      },
      {
         field: 'noOfOrder',
         flex: 0.5,
         minWidth: 100,
         headerName: t('table.numberOfOrders'),
         ...formatNumbericColumn,
         renderCell(params) {
            return (
               <NoneAdjustValueCell color={''} value={params?.row.noOfOrder}></NoneAdjustValueCell>
            );
         },
      },
      {
         field: 'additionalVolume',
         flex: 0.6,
         minWidth: 100,
         headerName: t('table.additionalUnits'),
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
         minWidth: 100,
         headerName: `${t('table.adjustedCost')} ('000 USD)`,
         ...formatNumbericColumn,
         backgroundColor: costAdjColor,
         renderCell(params) {
            return <CellColor color={costAdjColor} value={params?.row.manualAdjCost}></CellColor>;
         },
      },
      {
         field: 'manualAdjFreight',
         flex: 0.8,
         minWidth: 100,
         headerName: `${t('table.adjustedFreight')} ('000 USD)`,
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
         minWidth: 100,
         headerName: `${t('table.adjustedFX')} %`,
         ...formatNumbericColumn,
         backgroundColor: fxAdjColor,
         renderCell(params) {
            return (
               <CellPercentageColor
                  color={fxAdjColor}
                  value={params?.row.manualAdjFX * 100}
               ></CellPercentageColor>
            );
         },
      },

      {
         field: 'totalManualAdjCost',
         flex: 0.6,
         minWidth: 150,
         headerName: `${t('table.totalManualAdjCost')} ('000 USD)`,
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
         minWidth: 100,
         headerName: `${t('table.originalDealerNet')} ('000 USD)`,
         ...formatNumbericColumn,
         cellClassName: 'highlight-cell',
         headerClassName: 'origin',
         renderCell(params) {
            return <CellColor color={''} value={params?.row.originalDN}></CellColor>;
         },
      },
      {
         field: 'originalMargin',
         flex: 0.7,

         minWidth: 150,
         cellClassName: 'highlight-cell',
         headerClassName: 'origin',
         headerName: `${t('table.originalMargin')} ('000 USD)`,
         ...formatNumbericColumn,

         renderCell(params) {
            return <CellColor color={''} value={params?.row.originalMargin}></CellColor>;
         },
      },
      {
         field: 'originalMarginPercentage',
         flex: 0.7,
         minWidth: 100,
         cellClassName: 'highlight-cell',
         headerClassName: 'origin',
         headerName: t('table.originalMarginPercentage'),
         ...formatNumbericColumn,

         renderCell(params) {
            return (
               <CellPercentageColor
                  color={''}
                  value={params?.row.originalMarginPercentage * 100}
               ></CellPercentageColor>
            );
         },
      },
      {
         field: 'newDN',
         flex: 0.6,
         minWidth: 100,
         cellClassName: 'highlight-cell-adjusted',
         headerClassName: 'adjusted',
         headerName: `${t('table.adjustedDealerNet')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <CellColor color={dnAdjColor} value={params?.row.newDN}></CellColor>;
         },
      },
      {
         field: 'newMargin',
         flex: 0.6,
         minWidth: 100,
         cellClassName: 'highlight-cell-adjusted',
         headerClassName: 'adjusted',
         headerName: `${t('table.newMargin')}('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <CellColor color={totalColor} value={params?.row.newMargin}></CellColor>;
         },
      },
      {
         field: 'newMarginPercentage',
         flex: 0.6,
         minWidth: 100,
         cellClassName: 'highlight-cell-adjusted',
         headerClassName: 'adjusted',
         headerName: `${t('table.newMarginPercentage')}`,
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
   const columnGroupingModel: GridColumnGroupingModel = [
      {
         groupId: 'Original',
         headerName: 'Original',
         headerClassName: 'origin',
         children: [
            { field: 'originalDN' },
            { field: 'originalMargin' },
            { field: 'originalMarginPercentage' },
         ],
      },
      {
         groupId: 'Adjusted',
         headerName: 'Adjusted',
         headerClassName: 'adjusted',
         children: [{ field: 'newDN' }, { field: 'newMargin' }, { field: 'newMarginPercentage' }],
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
      if (n > 1) setTotalColor('#9EB9F9');
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
         setTotalColor('#FFDFBD');
         costAdjOld = dataCalculator.costAdjPercentage;
      }
      if (
         dataCalculator.freightAdj !== freightAdjOld &&
         !isZeroOrEmpty(dataCalculator.freightAdj)
      ) {
         n++;
         setFreightAdjColor('#f7c0a9');
         setTotalColor('#FFD7C6');
         dnAdjOld = dataCalculator.freightAdj;
      }
      if (dataCalculator.fxAdj !== fxAdjOld && !isZeroOrEmpty(dataCalculator.fxAdj)) {
         n++;
         setFxAdjColor('#e9d4c4');
         setTotalColor('#F6EEE8');
         fxAdjOld = dataCalculator.fxAdj;
      }
      if (
         dataCalculator.dnAdjPercentage !== dnAdjOld &&
         !isZeroOrEmpty(dataCalculator.dnAdjPercentage)
      ) {
         n++;
         setDnAdjColor('#FFE198');
         setTotalColor('#FFECBD');
         dnAdjOld = dataCalculator.dnAdjPercentage;
      }
      //
      if (n > 1) setTotalColor('#BECFF6');
      else if (n === 0) setTotalColor('');
   }, [costAdjColor, freightAdjColor, fxAdjColor, dnAdjColor]);

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setDataFilter(defaultValueFilterOrder);
   };

   const handleClearAllCalculators = () => {
      setDataCalculator(defaultValueCaculatorForAjustmentCost);
   };

   // show latest updated time
   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   useEffect(() => {
      convertTimezone();
   }, [serverLastUpdatedTime, serverTimeZone]);

   return (
      <>
         <AppLayout entity="adjustment">
            <Grid container spacing={1} sx={{ marginBottom: 2 }}>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.numberOfOrders')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {listTotalRow[0]?.noOfOrder}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.additionalUnits')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {listTotalRow[0]?.additionalVolume}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.originalDealerNet')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.originalDN)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.originalMargin')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.originalMargin)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.originalMarginPercentage')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(listTotalRow[0]?.originalMarginPercentage * 100)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.adjustedCost')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.manualAdjCost)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.adjustedFreight')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.manualAdjFreight)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.adjustedFX')} %
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(listTotalRow[0]?.manualAdjFX)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.totalManualAdjCost')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.totalManualAdjCost)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.adjustedDealerNet')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.newDN)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.newMargin')} ('000)
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           $ {formatNumber(listTotalRow[0]?.newMargin)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
               <Grid item xs={2.4}>
                  <Paper elevation={2} sx={paperStyle}>
                     <div className="space-between-element">
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {t('table.newMarginPercentage')}
                        </Typography>
                        <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                           {formatNumberPercentage(listTotalRow[0]?.newMarginPercentage * 100)}
                        </Typography>
                     </div>
                  </Paper>
               </Grid>
            </Grid>

            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.regions, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.regions}
                     label={t('filters.region')}
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
                     value={_.map(dataFilter.plants, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.plants}
                     label={t('filters.plant')}
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
                     value={_.map(dataFilter.metaSeries, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.metaSeries}
                     label={t('filters.metaSeries')}
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
                     value={_.map(dataFilter.dealers, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.dealers}
                     label={t('filters.dealerName')}
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
                     value={_.map(dataFilter.classes, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.classes}
                     label={t('filters.class')}
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
                     value={_.map(dataFilter.models, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.models}
                     label={t('filters.models')}
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
                     value={_.map(dataFilter.segments, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.segments}
                     label={t('filters.segment')}
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
                     value={
                        dataFilter.marginPercentage !== undefined
                           ? {
                                value: `${dataFilter.marginPercentage}`,
                             }
                           : { value: '' }
                     }
                     options={initDataFilter.marginPercentageGroup}
                     label={t('filters.marginPercentage')}
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
                     value={
                        dataFilter.marginPercentageAfterAdj !== undefined
                           ? {
                                value: `${dataFilter.marginPercentageAfterAdj}`,
                             }
                           : { value: '' }
                     }
                     options={initDataFilter.marginPercentageGroup}
                     label={t('table.newMarginPercentage')}
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

               <Grid item xs={2}>
                  <AppDateField
                     views={['day', 'month', 'year']}
                     label={t('filters.fromDate')}
                     name="from_date"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'fromDate')
                     }
                     value={dataFilter?.fromDate}
                     maxDate={new Date().toISOString().slice(0, 10)}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppDateField
                     views={['day', 'month', 'year']}
                     label={t('filters.toDate')}
                     name="toDate"
                     onChange={(e, value) =>
                        handleChangeDataFilter(_.isNil(value) ? '' : value, 'toDate')
                     }
                     value={dataFilter?.toDate}
                     maxDate={new Date().toISOString().slice(0, 10)}
                  />
               </Grid>

               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleFilterAdjustment}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.filter')}
                  </Button>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilters}
                     sx={{ width: '100%', height: 24, minWidth: 100 }}
                  >
                     {t('button.clear')}
                  </Button>
               </Grid>
            </Grid>
            <Grid container spacing={1} marginTop={0.5}>
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppNumberField
                        value={dataCalculator.costAdjPercentage}
                        sx={{ backgroundColor: '#FFCC99' }}
                        onChange={(e) => handleChangeDataCalculator(e.value, 'costAdjPercentage')}
                        name="costAdjPercentage"
                        label={`${t('table.adjustedCost')} %`}
                        placeholder="Cost Adj %"
                        suffix="%"
                     />
                  </Grid>
               </Grid>
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppNumberField
                        value={dataCalculator.freightAdj}
                        sx={{ backgroundColor: '#f7c0a9' }}
                        onChange={(e) => handleChangeDataCalculator(e.value, 'freightAdj')}
                        name="freightAdj"
                        label={`${t('table.adjustedFreight')} ('000 USD)`}
                        placeholder="Freight Adj ('000 USD)"
                        prefix="$"
                     />
                  </Grid>
               </Grid>{' '}
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppNumberField
                        value={dataCalculator.fxAdj}
                        sx={{ backgroundColor: '#e9d4c4' }}
                        onChange={(e) => handleChangeDataCalculator(e.value, 'fxAdj')}
                        name="fxAdj"
                        label={`${t('table.adjustedFX')} %`}
                        placeholder="FX Adj %"
                        suffix="%"
                     />
                  </Grid>
               </Grid>{' '}
               <Grid item xs={2}>
                  <Grid item xs={12}>
                     <AppNumberField
                        value={dataCalculator.dnAdjPercentage}
                        sx={{ backgroundColor: '#f9d06d' }}
                        onChange={(e) => handleChangeDataCalculator(e.value, 'dnAdjPercentage')}
                        name="dnAdjPercentage"
                        label={`${t('table.adjustedDealerNet')} %`}
                        placeholder="DN Adj %"
                        suffix="%"
                     />
                  </Grid>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleCalculator}
                     sx={{ width: '100%', height: 24, minWidth: 110 }}
                  >
                     {t('button.calculateData')}
                  </Button>
               </Grid>
               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllCalculators}
                     sx={{ width: '100%', height: 24, minWidth: 130 }}
                  >
                     {t('button.clearCalculators')}
                  </Button>
               </Grid>
            </Grid>

            <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
               <Grid container sx={{ height: 'calc(100vh - 283px)' }}>
                  {/* <DataGridPro
                     sx={{
                        '& .MuiDataGrid-cell': {
                           padding: 0,
                        },
                        '& .css-1ey3qrw-MuiDataGrid-root': {
                           padding: 0,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     hideFooter
                     disableColumnMenu
                     columnHeaderHeight={60}
                     rowHeight={30}
                     slots={{
                        toolbar: GridToolbar,
                     }}
                     rows={listAdjustment}
                     rowBufferPx={35}
                     columns={columns}
                     columnGroupingModel={columnGroupingModel}
                     getRowId={(params) => params.id}
                  /> */}

                  <AppDataTable
                     sx={{
                        '& .MuiDataGrid-cell': {
                           padding: 0,
                        },
                        '& .css-1ey3qrw-MuiDataGrid-root': {
                           padding: 0,
                        },
                        '& .MuiDataGrid-columnHeaderTitle': {
                           whiteSpace: 'break-spaces',
                           lineHeight: 1.2,
                        },
                     }}
                     columnHeaderHeight={60}
                     dataFilter={{ dataFilter: dataFilter, dataCalculate: dataCalculator }}
                     currency="USD"
                     entity="simulation-modeling"
                     rows={listAdjustment}
                     columns={columns}
                     columnGroupingModel={columnGroupingModel}
                     getRowId={(params) => params.id}
                  />
               </Grid>

               <DataTablePagination
                  page={tableState.pageNo}
                  perPage={tableState.perPage}
                  totalItems={tableState.totalItems}
                  onChangePage={handleChangePage}
                  onChangePerPage={handleChangePerPage}
                  lastUpdatedAt={clientLatestUpdatedTime}
                  lastUpdatedBy={serverLastUpdatedBy}
               />
               <AppBackDrop open={loadingTable} hightHeaderTable={'157px'} />
            </Paper>
         </AppLayout>
      </>
   );
}
