import { useEffect, useMemo, useState } from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { AccountCircle, ReplayOutlined as ReloadIcon } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { importTrackingStore } from '@/store/reducers';
import { createAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';

import { iconColumn } from '@/utils/columnProperties';

import { AppFooter, DataTable } from '@/components';
import Image from 'next/image';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { destroyCookie } from 'nookies';
import { parseCookies } from 'nookies';
import { DialogChangePassword } from '@/components/Dialog/Module/Dashboard/ChangePasswordDialog';
import { NavBar } from '@/components/App/NavBar';
import { checkTokenBeforeLoadPageAdmin } from '@/utils/checkTokenBeforeLoadPage';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require('@/public/logo.svg');

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
   open?: boolean;
}

import { GetServerSidePropsContext } from 'next';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { BASE_URL } from '@/Path/backend';
import { useTranslation } from 'react-i18next';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import _ from 'lodash';
import { formatDate } from '@/utils/formatDateInput';
import { DatePicker } from '@mui/x-date-pickers';
import { parseISO } from 'date-fns';

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
   const entityApp = 'importTracking';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);
   const router = useRouter();
   const dispatch = useDispatch();
   const listImportTracking = useSelector(importTrackingStore.selectListImportTracking);
   const cookies = parseCookies();
   const [userName, setUserName] = useState('');
   const serverTimeZone = useSelector(importTrackingStore.selectServerTimeZone);

   const initDataFilter = useSelector(importTrackingStore.selectDataFilter);
   const [dataFilter, setDataFilter] = useState(initDataFilter);

   useEffect(() => {
      setUserName(cookies['name']);
   }, []);

   useEffect(() => {
      dispatch(getListAction());
   }, [getListAction, router.query]);

   useEffect(() => {
      return () => {
         dispatch(resetStateAction());
      };
   }, [router.pathname]);

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

   const columns = [
      {
         field: 'fileType',
         flex: 0.6,
         headerAlign: 'center',
         headerName: t('table.fileStyle'),
      },
      {
         field: 'frequency',
         flex: 0.6,
         headerAlign: 'center',
         headerName: t('table.frequency'),
      },
      {
         ...iconColumn,
         field: 'active',
         flex: 0.3,
         headerName: t('user.status'),
         renderCell(params) {
            return (
               <Button
                  variant="outlined"
                  color={`${params?.row?.status === 'Completed' ? 'success' : 'error'}`}
               >
                  {params?.row?.status}
               </Button>
            );
         },
      },
      {
         field: 'fileName',
         flex: 0.8,
         headerAlign: 'center',
         headerName: t('table.fileName'),
         renderCell(params) {
            return (
               <a
                  onClick={() =>
                     handleDownloadFileImported(params?.row?.fileName, params?.row?.path)
                  }
                  style={{ cursor: 'pointer' }}
               >
                  {params?.row?.fileName}
               </a>
            );
         },
      },

      {
         field: 'uploadedTime',
         flex: 0.4,
         headerName: t('table.importAt'),
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return (
               <span>
                  {convertServerTimeToClientTimeZone(params?.row?.importAt, serverTimeZone)}
               </span>
            );
         },
      },
      {
         field: 'uploadedBy',
         flex: 0.5,
         headerName: t('table.importBy'),
         renderCell(params) {
            return <span>{params?.row?.importBy}</span>;
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
               <Grid container sx={{ padding: 1, paddingLeft: 1.5 }}>
                  <Grid item xs={2}>
                     <DatePicker
                        views={['month', 'year']}
                        label={t('filters.monthYear')}
                        onChange={(value) => handleChangeDataFilter(value)}
                        value={
                           dataFilter?.date
                              ? parseISO(dataFilter?.date)
                              : parseISO(formatDate(new Date()))
                        }
                        maxDate={parseISO(new Date().toISOString().slice(0, 10))}
                        format="yyyy-MM"
                     />
                  </Grid>
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
                        rows={listImportTracking}
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
