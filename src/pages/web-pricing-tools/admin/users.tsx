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
import CreateIcon from '@mui/icons-material/AddCircle';
import { AccountCircle, ReplayOutlined as ReloadIcon } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { commonStore, userStore } from '@/store/reducers';
import { createAction } from '@reduxjs/toolkit';
import { useRouter } from 'next/router';

import { centerColumn, iconColumn } from '@/utils/columnProperties';
import dashboardApi from '@/api/dashboard.api';

import { AppFooter, AppSearchBar, DataTable, DataTablePagination, EditIcon } from '@/components';
import { DialogCreateUser } from '@/components/Dialog/Module/Dashboard/CreateDialog';
import { DeactiveUserDialog } from '@/components/Dialog/Module/Dashboard/DeactiveUserDialog';
import { DialogUpdateUser } from '@/components/Dialog/Module/Dashboard/UpdateDialog';
import Image from 'next/image';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import { destroyCookie } from 'nookies';
import nookies, { parseCookies } from 'nookies';
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
import { useTranslation } from 'react-i18next';
import { DataGridPro } from '@mui/x-data-grid-pro';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPageAdmin(context);
}

const removeAllCookies = () => {
   const cookies = nookies.get();
   console.log('cookies', cookies);
   Object.keys(cookies).forEach((cookieName) => {
      nookies.destroy(null, cookieName, { path: '/' });
   });
};

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

export default function Dashboard() {
   const { t } = useTranslation();
   const [open, setOpen] = useState(true);
   createAction(`user/GET_LIST`);
   const entityApp = 'user';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);
   const router = useRouter();
   const dispatch = useDispatch();
   const listUser = useSelector(userStore.selectUserList);
   const tableState = useSelector(commonStore.selectTableState);
   const cookies = parseCookies();
   const [userName, setUserName] = useState('');

   useEffect(() => {
      setUserName(cookies['name']);
   }, []);

   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(userStore.sagaGetList());
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
      defaultLocale: 'en',
   };

   const [dialogCreateUser, setDialogCreateUser] = useState({
      open: false,
      detail: defaultValue as any,
   });

   const [updateUserState, setUpdateUserState] = useState({
      open: false,
      detail: {} as any,
   });

   const [deactivateUserState, setDeactivateUserState] = useState({
      open: false,
      detail: {} as any,
   });

   const [changePasswordState, setChangePasswordState] = useState({
      open: false,
      detail: {} as any,
   });

   const handleOpenCreateDialog = () => {
      setDialogCreateUser({
         open: true,
         detail: defaultValue,
      });
   };

   const handleCloseCreateDialog = () => {
      setDialogCreateUser({
         open: false,
         detail: defaultValue,
      });
   };

   const handleCloseDeactiveUser = () => {
      setDeactivateUserState({
         open: false,
         detail: {},
      });
   };

   const handleOpenDeactivateUser = (row) => {
      setDeactivateUserState({
         open: true,
         detail: { userName: row?.userName, id: row?.id, isActive: row?.active },
      });
   };

   const handleSearch = async (event, searchQuery) => {
      const { data } = await dashboardApi.getUser({ search: searchQuery });
      dispatch(userStore.actions.setUserList(JSON.parse(data)?.userList));
   };

   const handleOpenUpdateUserDialog = async (userId) => {
      try {
         // Get init data

         const { data } = await dashboardApi.getDetailUser(userId);

         // Open form
         setUpdateUserState({
            open: true,
            detail: JSON.parse(data)?.userDetails,
         });
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error));
      }
   };

   const handleCloseUpdateUserDialog = () => {
      setUpdateUserState({
         open: false,
         detail: {},
      });
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

         removeAllCookies();
         router.push('/login');
      } catch (err) {
         console.log(err);
      }
   };

   const columns = [
      {
         field: 'email',
         flex: 0.8,
         headerName: t('user.email'),
      },
      {
         field: 'name',
         flex: 0.8,
         headerName: t('user.name'),
      },
      {
         field: 'role',
         flex: 0.4,
         headerName: t('user.role'),
         renderCell(params) {
            return <span>{params.row.role.roleName}</span>;
         },
      },
      {
         field: 'lastLogin',
         flex: 0.4,
         headerName: t('user.lastLogin'),
         ...centerColumn,
         renderCell(params) {
            return <span>{formatDate(params?.row?.lastLogin)}</span>;
         },
      },
      {
         ...iconColumn,
         field: 'active',
         flex: 0.4,
         headerName: t('user.status'),
         ...centerColumn,
         renderCell(params) {
            return (
               <Button
                  variant="outlined"
                  color={`${params.row.active ? 'primary' : 'error'}`}
                  onClick={() => handleOpenDeactivateUser(params.row)}
                  sx={{
                     width: '80px',
                  }}
               >
                  {params.row.active ? t('user.active') : t('user.locked')}
               </Button>
            );
         },
      },
      {
         ...iconColumn,
         field: 'id',
         headerName: t('user.edit'),
         flex: 0.4,
         ...centerColumn,
         renderCell(params) {
            return <EditIcon onClick={() => handleOpenUpdateUserDialog(params.row.id)} />;
         },
      },
   ];

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
                  <Button variant="contained" style={{ marginLeft: 5 }} color="primary">
                     <ReloadIcon />
                     {t('user.reload')}
                  </Button>
                  <Button
                     onClick={handleOpenCreateDialog}
                     variant="contained"
                     style={{ marginLeft: 5 }}
                     color="primary"
                  >
                     <CreateIcon />
                     {t('user.newUser')}
                  </Button>
               </Grid>
               <Grid container sx={{ padding: 1, paddingLeft: 1.5 }}>
                  <AppSearchBar onSearch={handleSearch} placeholder={t('search')}></AppSearchBar>
               </Grid>
               <Paper elevation={1} sx={{ marginTop: 2 }}>
                  <Grid container sx={{ height: 'calc(100vh - 255px)', minHeight: '200px' }}>
                     <DataGridPro
                        sx={{
                           '& .MuiDataGrid-columnHeaderTitle': {
                              textOverflow: 'clip',
                              whiteSpace: 'break-spaces',
                              lineHeight: 1.2,
                           },
                        }}
                        columnHeaderHeight={80}
                        hideFooter
                        disableColumnMenu
                        rowHeight={50}
                        rows={listUser}
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

         <DialogCreateUser {...dialogCreateUser} onClose={handleCloseCreateDialog} />
         <DeactiveUserDialog {...deactivateUserState} onClose={handleCloseDeactiveUser} />
         <DialogUpdateUser {...updateUserState} onClose={handleCloseUpdateUserDialog} />
         <DialogChangePassword {...changePasswordState} onClose={handleCloseChangePasswordDialog} />
      </>
   );
}
