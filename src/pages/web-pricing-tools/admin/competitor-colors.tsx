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
import { commonStore, competitorColorStore } from '@/store/reducers';
import { useRouter } from 'next/router';

import { iconColumn } from '@/utils/columnProperties';
import { NavBar } from '@/components/App/NavBar';

import { AppFooter, AppSearchBar, DataTable, DataTablePagination, EditIcon } from '@/components';
import Image from 'next/image';
import { bindPopover, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import authApi from '@/api/auth.api';
import { destroyCookie, parseCookies } from 'nookies';
import { DialogUpdateCompetitor } from '@/components/Dialog/Module/CompetitorColorDialog/UpdateDialog';
import competitorColorApi from '@/api/competitorColor.api';
import { createAction } from '@reduxjs/toolkit';
import { DialogChangePassword } from '@/components/Dialog/Module/Dashboard/ChangePasswordDialog';
import { checkTokenBeforeLoadPageAdmin } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require('@/public/logo.svg');

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
   open?: boolean;
}

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

export default function competitorColors() {
   const { t } = useTranslation();
   const [open, setOpen] = useState(true);
   const router = useRouter();

   const entityApp = 'competitorColors';
   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);
   const searchRef = useRef(null);
   const cookies = parseCookies();
   const [userName, setUserName] = useState('');

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

   const dispatch = useDispatch();
   const tableState = useSelector(commonStore.selectTableState);
   const listCompetitorColor = useSelector(competitorColorStore.selectCompetitorColorList);

   const toggleDrawer = () => {
      setOpen(!open);
   };
   const popupState = usePopupState({
      variant: 'popover',
      popupId: 'demoPopover',
   });

   const [updateColorState, setUpdateColorState] = useState({
      open: false,
      detail: {} as any,
   });

   const reloadData = async (event) => {
      searchRef.current.clearSearchQuery();
      dispatch(competitorColorStore.actions.setCompetitorColorSearch(''));
      handleChangePage(1);
   };
   const handleSearch = async (event, searchQuery) => {
      dispatch(competitorColorStore.actions.setCompetitorColorSearch(searchQuery));
      handleChangePage(1);
   };
   const handleChangePage = (pageNo: number) => {
      dispatch(commonStore.actions.setTableState({ pageNo }));
      dispatch(competitorColorStore.sagaGetList());
   };

   const handleChangePerPage = (perPage: number) => {
      dispatch(commonStore.actions.setTableState({ perPage }));
      handleChangePage(1);
   };

   const handleOpenUpdateColorDialog = async (id) => {
      try {
         // Get init data

         const { data } = await competitorColorApi.getCompetitorColorById({ id });
         // Open form
         setUpdateColorState({
            open: true,
            detail: JSON.parse(data)?.competitorColorDetail,
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

   const handleLogOut = () => {
      try {
         popupState.close();

         authApi.logOut();
         destroyCookie(null, 'token', { path: '/' });
         destroyCookie(null, 'refresh_token', { path: '/' });
         router.push('/login');
      } catch (err) {
         console.log(err);
      }
   };

   const columns = [
      {
         field: 'groupName',
         flex: 0.8,
         headerName: t('competitors.competitorName'),
      },
      {
         field: 'colorCode',
         flex: 0.8,
         headerName: t('competitors.colorCode'),
      },
      {
         flex: 0.8,
         headerName: t('competitors.color'),
         renderCell(params) {
            return <div style={{ backgroundColor: params.row.colorCode, width: 30, height: 30 }} />;
         },
      },
      {
         ...iconColumn,
         field: 'id',
         headerName: t('user.edit'),
         flex: 0.2,
         renderCell(params) {
            return <EditIcon onClick={() => handleOpenUpdateColorDialog(params.row.id)} />;
         },
      },
   ];

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
                     onClick={handleOpenChangePasswordDialog}
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
                     onClick={reloadData}
                     variant="contained"
                     style={{ marginLeft: 5 }}
                     color="primary"
                  >
                     <ReloadIcon />
                     {t('user.reload')}
                  </Button>
               </Grid>
               <Grid container sx={{ padding: 1, paddingLeft: 1.5 }}>
                  <AppSearchBar
                     ref={searchRef}
                     onSearch={handleSearch}
                     placeholder={t('search')}
                  ></AppSearchBar>
               </Grid>
               <Paper elevation={1} sx={{ marginLeft: 1.5, marginRight: 1.5 }}>
                  <Grid container>
                     <DataTable
                        hideFooter
                        disableColumnMenu
                        tableHeight={720}
                        rowHeight={50}
                        rows={listCompetitorColor}
                        columns={columns}
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

         <DialogUpdateCompetitor {...updateColorState} onClose={handleCloseUpdateColorDialog} />
         <DialogChangePassword {...changePasswordState} onClose={handleCloseChangePasswordDialog} />
      </>
   );
}
