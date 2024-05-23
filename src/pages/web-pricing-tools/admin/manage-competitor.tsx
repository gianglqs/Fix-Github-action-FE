import { AccountCircle, ReplayOutlined as ReloadIcon } from '@mui/icons-material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import { Button, Popover } from '@mui/material';
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

import { importTrackingStore, indicatorStore } from '@/store/reducers';
import { createAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';

import { formatNumbericColumn } from '@/utils/columnProperties';

import { AppFooter, DataTable } from '@/components';
import { NavBar } from '@/components/App/NavBar';
import { DialogChangePassword } from '@/components/Dialog/Module/Dashboard/ChangePasswordDialog';
import { checkTokenBeforeLoadPageAdmin } from '@/utils/checkTokenBeforeLoadPage';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import Image from 'next/image';
import { destroyCookie, parseCookies } from 'nookies';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require('@/public/logo.svg');

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
   open?: boolean;
}

import { BASE_URL } from '@/Path/backend';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { formatNumber, formatNumberPercentage } from '@/utils/formatCell';
import { formatDate } from '@/utils/formatDateInput';
import _ from 'lodash';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';

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
   const entityApp = 'importTRacjubg';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   //   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);
   const router = useRouter();
   const dispatch = useDispatch();
   const listImportTracking = useSelector(importTrackingStore.selectListImportTracking);
   const cookies = parseCookies();
   const [userName, setUserName] = useState('');
   const serverTimeZone = useSelector(importTrackingStore.selectServerTimeZone);

   const initDataFilter = useSelector(importTrackingStore.selectDataFilter);
   const [dataFilter, setDataFilter] = useState(initDataFilter);
   const getDataForTable = useSelector(indicatorStore.selectIndicatorList);

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

   const currentYear = new Date().getFullYear();

   const columns = [
      {
         field: 'competitorName',
         flex: 0.8,
         minWidth: 100,
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
         flex: 0.6,
         minWidth: 60,
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
   ];

   const handleReload = () => {
      dispatch(importTrackingStore.sagaGetList());
   };

   const handleDownloadFileImported = (fileName: string, path: string) => {
      const fileURL = BASE_URL + path;

      fetch(fileURL, { method: 'GET' })
         .then((response) => response.blob())
         .then((blob) => {
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);

            // Append to html link element page
            document.body.appendChild(link);

            // Start download
            link.click();

            // Clean up and remove the link
            link.parentNode.removeChild(link);
         })
         .catch((e) => {
            console.log(e);
         });
   };

   const handleChangeDataFilter = (date) => {
      const dateString = formatDate(date);

      setDataFilter({ date: dateString });
   };

   useEffect(() => {
      const debouncedHandleWhenChangeDataFilter = _.debounce(() => {
         if (dataFilter.date) {
            dispatch(importTrackingStore.actions.setDataFilter(dataFilter));
            dispatch(importTrackingStore.sagaGetList());
         }
      }, 700);

      debouncedHandleWhenChangeDataFilter();

      return () => debouncedHandleWhenChangeDataFilter.cancel();
   }, [dataFilter]);

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
               <Grid container justifyContent="flex-end" sx={{ padding: 1 }}>
                  <Button
                     variant="contained"
                     style={{ marginLeft: 5 }}
                     onClick={handleReload}
                     color="primary"
                  >
                     <ReloadIcon />
                     {t('user.reload')}
                  </Button>
               </Grid>

               <Paper elevation={1} sx={{ marginTop: 2 }}>
                  <Grid container>
                     <DataTable
                        sx={{
                           '& .MuiDataGrid-columnHeaderTitle': {
                              textOverflow: 'clip',
                              whiteSpace: 'break-spaces',
                              lineHeight: 1.2,
                           },
                           height: 'calc(100vh - 195px)',
                        }}
                        columnHeaderHeight={65}
                        hideFooter
                        disableColumnMenu
                        rowHeight={60}
                        rows={getDataForTable}
                        rowBuffer={35}
                        rowThreshold={25}
                        columns={columns}
                        getRowId={(params) => params.fileType}
                     />
                  </Grid>

                  <AppFooter />
               </Paper>
            </Box>
         </Box>

         <DialogChangePassword {...changePasswordState} onClose={handleCloseChangePasswordDialog} />
         <LogImportFailureDialog />
      </>
   );
}
