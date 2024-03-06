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
import { Button, Link, Popover, Tooltip } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { commonStore, historicalImportStore, userStore } from '@/store/reducers';
import { createAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';

import { iconColumn } from '@/utils/columnProperties';

import { AppFooter, AppSearchBar, DataTable, DataTablePagination, EditIcon } from '@/components';
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
import { formatDate } from '@/utils/formatCell';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { BASE_URL } from '@/Path/backend';

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

export default function HistoricalImport() {
   const [open, setOpen] = useState(true);
   createAction(`historicalImport/GET_LIST`);
   const entityApp = 'historicalImport';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);
   const router = useRouter();
   const dispatch = useDispatch();
   const listHistoricalImport = useSelector(historicalImportStore.selectListHistoricalImporting);
   const tableState = useSelector(commonStore.selectTableState);
   const cookies = parseCookies();
   const [userName, setUserName] = useState('');
   const serverTimeZone = useSelector(historicalImportStore.selectServerTimeZone);

   useEffect(() => {
      setUserName(cookies['name']);
   }, []);

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(historicalImportStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

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

   const handleSearch = async (event, searchQuery) => {
      console.log('search');
      dispatch(historicalImportStore.actions.setDataFilter(searchQuery));
      dispatch(historicalImportStore.sagaGetList());
   };

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
         field: 'uuid',
         flex: 0.6,
         headerAlign: 'center',
         headerName: 'UUID',
      },
      {
         field: 'fileName',
         flex: 0.8,
         headerAlign: 'center',
         headerName: 'File name',
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
         field: 'screen',
         flex: 0.3,
         headerAlign: 'center',
         headerName: 'Model',
      },
      {
         field: 'uploadedTime',
         flex: 0.4,
         headerName: 'Import at',
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return (
               <span>
                  {convertServerTimeToClientTimeZone(params?.row?.uploadedTime, serverTimeZone)}
               </span>
            );
         },
      },
      {
         field: 'uploadedBy',
         flex: 0.5,
         headerName: 'Import by',
         renderCell(params) {
            return <span>{params?.row?.uploadedBy?.name}</span>;
         },
      },
      {
         field: 'email',
         flex: 0.6,
         headerName: 'Email',
         renderCell(params) {
            return <span>{params?.row?.uploadedBy?.email}</span>;
         },
      },

      {
         ...iconColumn,
         field: 'active',
         flex: 0.3,
         headerName: 'Status',
         renderCell(params) {
            return (
               <Tooltip title={!params.row.success && params.row.message} placement="top">
                  {!params.row.loading && (
                     <Button
                        variant="outlined"
                        color={`${params.row.success ? 'success' : 'error'}`}
                     >
                        {params.row.success ? 'success' : 'failure'}
                     </Button>
                  )}
               </Tooltip>
            );
         },
      },
   ];

   const handleReload = () => {
      dispatch(historicalImportStore.sagaGetList());
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
                     Change Password
                  </Typography>
                  <Typography
                     style={{ margin: 10, cursor: 'pointer' }}
                     onClick={handleLogOut}
                     data-testid="user-item-testid"
                     id="logout__testid"
                  >
                     Log out
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
                     Reload
                  </Button>
               </Grid>
               <Grid container sx={{ padding: 1, paddingLeft: 1.5 }}>
                  <AppSearchBar onSearch={handleSearch}></AppSearchBar>
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
                           height: 'calc(100vh - 257px)',
                        }}
                        columnHeaderHeight={65}
                        hideFooter
                        disableColumnMenu
                        rowHeight={60}
                        rows={listHistoricalImport}
                        rowBuffer={35}
                        rowThreshold={25}
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
                  />
                  <AppFooter />
               </Paper>
            </Box>
         </Box>

         <DialogChangePassword {...changePasswordState} onClose={handleCloseChangePasswordDialog} />
      </>
   );
}
