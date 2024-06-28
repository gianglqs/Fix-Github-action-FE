import { AccountCircle } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import {
   Backdrop,
   Button,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogContentText,
   DialogTitle,
   Popover,
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MuiDrawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

import { commonStore, importTrackingStore, manageCompetitorStore } from '@/store/reducers';
import { createAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { formatNumbericColumn, iconColumn } from '@/utils/columnProperties';

import { AppAutocomplete, AppFooter, DataTablePagination, EditIcon } from '@/components';
import { NavBar } from '@/components/App/NavBar';
import { DialogChangePassword } from '@/components/Dialog/Module/Dashboard/ChangePasswordDialog';
import { checkTokenBeforeLoadPageAdmin } from '@/utils/checkTokenBeforeLoadPage';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

import DialogEditDataIndicator from '@/components/Dialog/Module/EditDataIndicator';
import { ReplayOutlined as ReloadIcon } from '@mui/icons-material';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require('@/public/logo.svg');

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
   open?: boolean;
}

import indicatorApi from '@/api/indicators.api';
import { isEmptyObject } from '@/utils/checkEmptyObject';
import { defaultValueFilterIndicator } from '@/utils/defaultValues';
import { formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro';
import { produce } from 'immer';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPageAdmin(context);
}

const AppBar = styled(MuiAppBar, {
   shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
   zIndex: theme.zIndex.drawer + 1,
   transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
   }),
   ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.enteringScreen,
      }),
   }),
}));

const Drawer = styled(MuiDrawer, {
   shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
   '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
         easing: theme.transitions.easing.sharp,
         duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
         overflowX: 'hidden',
         transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
         }),
         width: theme.spacing(7),
         [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
         },
      }),
   },
}));

export default function ImportTracking() {
   const { t } = useTranslation();

   const [open, setOpen] = useState(true);
   const entityApp = 'manage-competitor';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   //   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);
   const router = useRouter();
   const dispatch = useDispatch();
   const listImportTracking = useSelector(importTrackingStore.selectListImportTracking);
   const cookies = parseCookies();
   const [userName, setUserName] = useState('');
   const tableState = useSelector(commonStore.selectTableState);
   const initDataFilter = useSelector(manageCompetitorStore.selectInitDataFilter);
   const cacheDataFilter = useSelector(manageCompetitorStore.selectDataFilter);
   const getDataForTable = useSelector(manageCompetitorStore.selectIndicatorList);
   const [dataFilter, setDataFilter] = useState(cacheDataFilter);
   const [loadingTable, setLoadingTable] = useState(false);
   const loadingPage = useSelector(manageCompetitorStore.selectLoadingPage);
   const serverTimeZone = useSelector(manageCompetitorStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(manageCompetitorStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(manageCompetitorStore.selectLastUpdatedBy);

   useEffect(() => {
      setUserName(cookies['name']);
   }, []);

   useEffect(() => {
      dispatch(getListAction());
   }, [getListAction, router.query]);

   // useEffect(() => {
   //    return () => {
   //       dispatch(resetStateAction());
   //    };
   // }, [router.pathname]);

   const toggleDrawer = () => {
      setOpen(!open);
   };
   const popupState = usePopupState({
      variant: 'popover',
      popupId: 'demoPopover',
   });

   const defaultValue = {
      userName: '',
      password: '',
      email: '',
      role: 1,
      defaultLocale: 'us',
   };

   const [changePasswordState, setChangePasswordState] = useState({
      open: false,
      detail: {} as any,
   });

   const handleOpenChangePasswordDialog = () => {
      popupState.close();
      setChangePasswordState({
         open: true,
         detail: {},
      });
   };

   const handleCloseChangePasswordDialog = () => {
      setChangePasswordState({
         open: false,
         detail: {},
      });
   };

   const [dataEditCompetitor, setDataEditCompetitor] = useState({ id: null, color: {} });
   const [openEditCompetitor, setOpenEditCompetitor] = useState({});

   const handleOpenEditIndicatorDialog = (row: any) => {
      indicatorApi
         .getCompetitorById(row.row.id)
         .then((res) => {
            const data = JSON.parse(String(res.data));
            // data.updateDate = formatDate(new Date(data.updateDate));
            setDataEditCompetitor(data);
            setOpenEditCompetitor({ open: true, isCreate: false, setOpenConfirmDeleteDialog });
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleDeleteCompetitor = () => {
      indicatorApi
         .deleteCompetitor(dataEditCompetitor.id)
         .then((res) => {
            dispatch(commonStore.actions.setSuccessMessage(res.data.message));
            dispatch(manageCompetitorStore.sagaGetList());
            handleCloseEditCompetitorDialog();
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleOpenCreateIndicatorDialog = () => {
      setDataEditCompetitor({ id: null, color: {} });
      setOpenEditCompetitor({ open: true, isCreate: true });
   };

   const handleCloseEditCompetitorDialog = () => {
      setOpenEditCompetitor({ open: false, isCreate: false });
   };

   const handleLogOut = () => {
      try {
         popupState.close();

         destroyCookie(null, 'token', { path: '/' });
         destroyCookie(null, 'refresh_token', { path: '/' });
         router.push('/login');
      } catch (err) {
         console.log(err);
      }
   };

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(manageCompetitorStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const currentYear = new Date().getFullYear();

   const columns = [
      {
         field: 'competitorName',
         flex: 0.8,
         minWidth: 150,
         headerName: t('competitors.competitorName'),
      },

      {
         field: 'region',
         flex: 0.7,
         minWidth: 60,
         headerName: t('table.region'),
         renderCell(params) {
            return <span>{params.row.country.region.regionName}</span>;
         },
      },
      {
         field: 'plant',
         flex: 0.7,
         minWidth: 100,
         headerName: t('table.plant'),
      },
      {
         field: 'clazz',
         flex: 1,
         minWidth: 60,
         headerName: t('table.class'),
         renderCell(params) {
            return <span>{params.row.clazz?.clazzName}</span>;
         },
      },
      {
         field: 'series',
         flex: 0.6,
         minWidth: 60,
         headerName: t('table.series'),
         renderCell(params) {
            return <span>{params.row.series?.series}</span>;
         },
      },

      {
         field: 'actual',
         flex: 0.6,
         minWidth: 100,
         headerName: `${currentYear - 1} Actual`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.actual}</span>;
         },
      },
      {
         field: 'aopf',
         flex: 0.6,
         minWidth: 60,
         headerName: `${currentYear} AOPF`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.aopf}</span>;
         },
      },
      {
         field: 'lrff',
         flex: 0.6,
         minWidth: 60,
         headerName: `${currentYear + 1} LRFF`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{params.row.lrff}</span>;
         },
      },
      {
         field: 'competitorLeadTime',
         flex: 0.8,
         minWidth: 60,
         headerName: t('competitors.competitorLeadTime'),
         ...formatNumbericColumn,
      },
      {
         field: 'dealerStreetPricing',
         flex: 0.8,
         minWidth: 140,
         headerName: `${t('competitors.dealerStreetPricing')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerStreetPricing)}</span>;
         },
      },
      {
         field: 'dealerHandlingCost',
         flex: 0.8,
         minWidth: 130,
         headerName: `${t('competitors.dealerHandlingCost')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerHandlingCost)}</span>;
         },
      },
      {
         field: 'competitorPricing',
         flex: 1,
         minWidth: 100,
         headerName: `${t('competitors.competitorPricing')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.competitorPricing)}</span>;
         },
      },
      {
         field: 'dealerPricingPremiumPercentage',
         flex: 1,
         minWidth: 100,
         headerName: `${t('competitors.dealerPricingPremium')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.dealerPricingPremiumPercentage)}</span>;
         },
      },

      {
         field: 'dealerPremiumPercentage',
         flex: 1,
         minWidth: 100,
         headerName: `${t('competitors.dealerPremium')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.dealerPremiumPercentage * 100)}</span>;
         },
      },
      {
         field: 'averageDN',
         flex: 0.8,
         minWidth: 100,
         headerName: `${t('competitors.averageDealerNet')} ('000 USD)`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumber(params.row.averageDN)}</span>;
         },
      },

      {
         field: 'variancePercentage',
         flex: 0.6,
         minWidth: 100,
         headerName: `${t('competitors.variancePercentage')}`,
         ...formatNumbericColumn,
         renderCell(params) {
            return <span>{formatNumberPercentage(params.row.variancePercentage * 100)}</span>;
         },
      },
      {
         field: 'edit',
         flex: 0.3,
         minWidth: 60,
         ...iconColumn,
         headerName: `${t('competitors.edit')}`,
         renderCell(params) {
            return <EditIcon onClick={() => handleOpenEditIndicatorDialog(params)} />;
         },
      },
   ];

   const handleReload = () => {
      dispatch(manageCompetitorStore.sagaGetList());
   };

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['chineseBrand', 'marginPercentage'], field)) {
               draft[field] = option.value;
            } else {
               draft[field] = option.map(({ value }) => value);
               console.log(draft[field]);
            }
         })
      );
   };

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (!isEmptyObject(dataFilter) && dataFilter != cacheDataFilter) {
            setCookie(null, 'manage-competitor', JSON.stringify(dataFilter), {
               maxAge: 604800,
               path: '/',
            });
            handleFilterIndicator();
         }
      }, 500);
      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

   const handleFilterIndicator = () => {
      setLoadingTable(true);
      dispatch(manageCompetitorStore.actions.setDefaultValueFilterIndicator(dataFilter));
      handleChangePage(1);
   };

   const handleClearAllFilterTable = () => {
      setDataFilter(defaultValueFilterIndicator);
   };

   const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);

   const handleCloseConfirmDeleteDialog = () => {
      setOpenConfirmDeleteDialog(false);
   };

   // adjust color

   const [updateColorState, setUpdateColorState] = useState({
      open: false,
      detail: {} as any,
   });

   const handleOpenUpdateColorDialog = (data) => {
      try {
         // Get init data

         // Open form
         setUpdateColorState({
            open: true,
            detail: data?.color,
         });
      } catch (error) {
         // dispatch(commonStore.actions.setErrorMessage(error))
      }
   };

   const handleCloseUpdateColorDialog = () => {
      setUpdateColorState({
         open: false,
         detail: {},
      });
   };
   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');
   useEffect(() => {
      convertTimezone();
   }, [serverTimeZone, serverLastUpdatedTime]);

   // show latest updated time
   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   return (
      <>
         <Box sx={{ display: 'flex' }}>
            <AppBar position="absolute" open={open}>
               <Toolbar
                  sx={{
                     pr: '24px', // keep right padding when drawer closed
                  }}
               >
                  <IconButton
                     edge="start"
                     color="inherit"
                     aria-label="open drawer"
                     onClick={toggleDrawer}
                     sx={{
                        marginRight: '36px',
                        ...(open && { display: 'none' }),
                     }}
                  >
                     <MenuIcon />
                  </IconButton>
                  <Typography
                     component="h1"
                     variant="h6"
                     color="inherit"
                     noWrap
                     sx={{ flexGrow: 1 }}
                  >
                     {/* Dashboard */}
                  </Typography>
                  <IconButton color="inherit">
                     <Badge
                        color="secondary"
                        {...bindTrigger(popupState)}
                        style={{ alignItems: 'center' }}
                     >
                        <div style={{ fontSize: 16, marginRight: 10 }}>{userName}</div>
                        <div data-testid="profile-testid">
                           <AccountCircle style={{ marginRight: 5, marginTop: 3, fontSize: 20 }} />
                        </div>
                     </Badge>
                  </IconButton>
               </Toolbar>
               <Popover
                  {...bindPopover(popupState)}
                  anchorOrigin={{
                     vertical: 'bottom',
                     horizontal: 'center',
                  }}
                  transformOrigin={{
                     vertical: 'top',
                     horizontal: 'center',
                  }}
                  disableRestoreFocus
               >
                  <Typography
                     style={{ margin: 10, cursor: 'pointer' }}
                     onClick={() => handleOpenChangePasswordDialog()}
                     data-testid="user-item-testid"
                     id="logout__testid"
                  >
                     {t('user.changePassword')}
                  </Typography>
                  <Typography
                     style={{ margin: 10, cursor: 'pointer' }}
                     onClick={handleLogOut}
                     data-testid="user-item-testid"
                     id="logout__testid"
                  >
                     {t('user.logOut')}
                  </Typography>
               </Popover>
            </AppBar>
            <Drawer variant="permanent" open={open}>
               <Toolbar
                  sx={{
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'flex-end',
                     px: [1],
                  }}
               >
                  <a href="/web-pricing-tools/admin/users" style={{ width: 185, height: 60 }}>
                     <Image src={logo} width={185} height={60} alt="Hyster-Yale" />
                  </a>
                  <IconButton onClick={toggleDrawer}>
                     <ChevronLeftIcon />
                  </IconButton>
               </Toolbar>
               <Divider />
               <List component="nav">
                  <NavBar />
               </List>
            </Drawer>
            <Box
               component="main"
               sx={{
                  backgroundColor: (theme) =>
                     theme.palette.mode === 'light'
                        ? theme.palette.grey[100]
                        : theme.palette.grey[900],
                  flexGrow: 1,
                  height: '100vh',
                  overflow: 'auto',
               }}
            >
               <Toolbar />
               <Grid container spacing={1} marginTop={1} sx={{ padding: '0 20px' }}>
                  <Grid
                     container
                     xs={12}
                     sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}
                  >
                     <Button
                        variant="contained"
                        style={{ marginLeft: 5 }}
                        onClick={handleReload}
                        color="primary"
                     >
                        <ReloadIcon />
                        {t('user.reload')}
                     </Button>
                     <Button
                        variant="contained"
                        onClick={handleOpenCreateIndicatorDialog}
                        sx={{ minWidth: 100 }}
                     >
                        {t('button.create')}
                     </Button>
                  </Grid>
                  <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                     <AppAutocomplete
                        value={_.map(dataFilter.competitorNames, (item) => {
                           return { value: item };
                        })}
                        options={initDataFilter.competitorNames}
                        label={t('filters.competitor')}
                        sx={{ height: 25, zIndex: 10 }}
                        onChange={(e, option) => handleChangeDataFilter(option, 'competitorNames')}
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
                  {/*<Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
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
                  </Grid>*/}
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

                  <Grid item xs={2}>
                     <AppAutocomplete
                        value={
                           dataFilter.chineseBrand != '' ? { value: dataFilter.chineseBrand } : null
                        }
                        options={initDataFilter.chineseBrands}
                        label={t('filters.chineseBrand')}
                        onChange={
                           (e, option) =>
                              handleChangeDataFilter(_.isNil(option) ? '' : option, 'chineseBrand')
                           //   handleChangeDataFilter(option, 'chineseBrand')
                        }
                        disableClearable={false}
                        primaryKeyOption="value"
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => (option.value ? `${option.value}` : '')}
                     />
                  </Grid>

                  <Grid item xs={2}>
                     <AppAutocomplete
                        value={
                           dataFilter.marginPercentage != ''
                              ? { value: dataFilter.marginPercentage }
                              : null
                        }
                        options={initDataFilter.marginPercentageGrouping}
                        label={t('filters.marginPercentage')}
                        primaryKeyOption="value"
                        onChange={(e, option) =>
                           handleChangeDataFilter(_.isNil(option) ? '' : option, 'marginPercentage')
                        }
                        disableClearable={false}
                        renderOption={(prop, option) => `${option.value}`}
                        getOptionLabel={(option) => (option.value ? `${option.value}` : '')}
                     />
                  </Grid>

                  <Grid item xs={1}>
                     <Button
                        variant="contained"
                        onClick={handleFilterIndicator}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.filter')}
                     </Button>
                  </Grid>
                  <Grid item xs={1}>
                     <Button
                        variant="contained"
                        onClick={handleClearAllFilterTable}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.clear')}
                     </Button>
                  </Grid>
               </Grid>

               <Paper elevation={1} sx={{ marginTop: 2, position: 'relative' }}>
                  <Grid container sx={{ height: 'calc(100vh - 255px)', minHeight: '200px' }}>
                     <DataGridPro
                        sx={{
                           '& .MuiDataGrid-columnHeaderTitle': {
                              textOverflow: 'clip',
                              whiteSpace: 'break-spaces',
                              lineHeight: 1.2,
                           },
                        }}
                        columnHeaderHeight={100}
                        hideFooter
                        disableColumnMenu
                        slots={{
                           toolbar: GridToolbar,
                        }}
                        rowHeight={35}
                        rows={getDataForTable}
                        rowBufferPx={35}
                        columns={columns}
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
               </Paper>

               <AppFooter />
            </Box>
         </Box>

         <DialogEditDataIndicator
            data={dataEditCompetitor}
            setData={setDataEditCompetitor}
            {...openEditCompetitor}
            onClose={handleCloseEditCompetitorDialog}
            openEditColorDialog={handleOpenUpdateColorDialog}
         />
         <DialogChangePassword {...changePasswordState} onClose={handleCloseChangePasswordDialog} />

         <ConfirmDeleteDialog
            open={openConfirmDeleteDialog}
            onClose={handleCloseConfirmDeleteDialog}
            handleDelete={handleDeleteCompetitor}
         />

         <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999 }}
            open={loadingPage}
         >
            <CircularProgress color="inherit" />
         </Backdrop>
      </>
   );
}

const ConfirmDeleteDialog = (props) => {
   const { open, onClose, handleDelete } = props;

   const handleAgree = () => {
      handleDelete();
      onClose();
   };

   return (
      <Dialog
         open={open}
         onClose={onClose}
         aria-labelledby="alert-dialog-title"
         aria-describedby="alert-dialog-description"
      >
         <DialogTitle id="alert-dialog-title">
            {'Do you want to delete Competitor record'}
         </DialogTitle>
         <DialogContent>
            <DialogContentText id="alert-dialog-description">
               If you click OK, this item will be permanently deleted and cannot be restored. Are
               you sure you want to proceed?
            </DialogContentText>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose}>Disagree</Button>
            <Button onClick={handleAgree} autoFocus>
               Agree
            </Button>
         </DialogActions>
      </Dialog>
   );
};
