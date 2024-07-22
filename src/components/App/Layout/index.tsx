import { useEffect, useMemo, useState } from 'react';
import useStyles from './styles';

import { Router, useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import _ from 'lodash';

import { createAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { AccountCircle } from '@mui/icons-material';
import { AppBar, Button, Grid, Popover, Typography } from '@mui/material';
import { usePopupState, bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { AppLayoutProps } from './type';
import AppFooter from '../Footer';
import nookies, { destroyCookie, parseCookies } from 'nookies';
import { DialogChangePassword } from '@/components/Dialog/Module/Dashboard/ChangePasswordDialog';
import Image from 'next/image';
import { NextPageContext } from 'next';
import { useTranslation } from 'react-i18next';
import { DialogUpdateUser } from '@/components/Dialog/Module/Dashboard/UpdateDialog';
import { commonStore } from '@/store/reducers';
import dashboardApi from '@/api/dashboard.api';

import * as React from 'react';
import { Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';

const smallLogo = require('@/public/smallLogo.svg');

const removeAllCookies = () => {
   const cookies = nookies.get();
   console.log('cookies', cookies);
   Object.keys(cookies).forEach((cookieName) => {
      nookies.destroy(null, cookieName, { path: '/' });
   });
};

const AppLayout: React.FC<AppLayoutProps> = (props) => {
   const { children, entity, heightBody } = props;
   const classes = useStyles();
   const { t } = useTranslation();

   const popupState = usePopupState({
      variant: 'popover',
      popupId: 'demoPopover',
   });

   const router = useRouter();
   const dispatch = useDispatch();

   const entityApp = useMemo(() => {
      return entity;
   }, [entity]);

   const getListAction = useMemo(() => createAction(`${entityApp}/GET_LIST`), [entityApp]);
   const resetStateAction = useMemo(() => createAction(`${entityApp}/RESET_STATE`), [entityApp]);

   let cookies = parseCookies();
   let userRoleCookies = cookies['role'];
   let userId = cookies['id'];
   const [userName, setUserName] = useState('');

   useEffect(() => {
      const userName = localStorage.getItem('name');
      setUserName(userName);
   }, []);

   useEffect(() => {
      dispatch(getListAction());
   }, [getListAction, router.query]);

   useEffect(() => {
      return () => {
         dispatch(resetStateAction());
      };
   }, [router.pathname]);

   const menuObj = {
      'financial-bookings': t('title.financialBookings'),
      'financial-shipments': t('title.financialShipments'),
      'quotation-margin': t('title.quotationMarginPercentage'),
      'volume-discount-analysis': t('title.volumeDiscountAnalysis'),
      // 'competitor-benchmark': t('title.competitorBenchmark'),
      'competitor-benchmark-v2': t('title.competitorBenchmark'),
      'simulation-modelling': t('title.simulationModelling'),
      // 'competitor-bubbles': 'Competitor Bubbles',
      'product-margin-analytics': t('title.productMarginAnalytics'),
      products: t('title.products'),
      'exchange-rates': t('title.exchangeRates'),
      'data-scraping': t('title.dataScraping'),
      'booking-margin-trial-test': t('title.bookingMarginTrialTest'),
      'gum-report': t('title.gumReport'),
      // 'price-volume-sensitivity': t('title.priceVolumeSensitivity'),
      'residual-value': t('title.residualValue'),
      'long-term-rental': t('title.longTermRental'),
   };

   // Multilevel Menus

   const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
   const isMenuOpen = Boolean(anchorEl);

   const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
   };

   const handleMenuClose = () => {
      setAnchorEl(null);
   };

   const renderBookingMenu = (
      <Menu
         anchorEl={anchorEl}
         anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
         }}
         id='booking-menu'
         keepMounted
         transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
         }}
         open={isMenuOpen}
         onClose={handleMenuClose}>
         <MenuItem onClick={handleMenuClose}>
            Orders
         </MenuItem>
         <Divider />
         <MenuItem onClick={handleMenuClose}>
            Financial Booking
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Financial Shipment
         </MenuItem>
      </Menu>
   );

   const renderPricingMenu = (
      <Menu
         anchorEl={anchorEl}
         anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
         }}
         id='pricing-menu'
         keepMounted
         transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
         }}
         open={isMenuOpen}
         onClose={handleMenuClose}>
         <MenuItem onClick={handleMenuClose}>
            Pricing
         </MenuItem>
         <Divider />
         <MenuItem onClick={handleMenuClose}>
            Quotation Margin %
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Volumn Discount Analysis
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Competitor Benchmark
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Simulate Modelling
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Product Margin Analytics
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Residulal Value
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Longterm Rental
         </MenuItem>
         <MenuItem onClick={handleMenuClose}>
            Booking Margin Trial Test
         </MenuItem>
      </Menu>
   );

   const handleLogOut = () => {
      try {
         // destroyCookie(null, 'token', { path: '/' });
         // destroyCookie(null, 'refresh_token', { path: '/' });
         removeAllCookies();
         router.push('/login');
      } catch (err) {
         console.log(err);
      }
   };

   const handleAdminPage = () => {
      try {
         popupState.close();
         router.push('/web-pricing-tools/admin/users');
      } catch (err) {
         console.log(err);
      }
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

   const [updateUserState, setUpdateUserState] = useState({
      open: false,
      detail: {} as any,
   });

   const handleCloseUpdateUserDialog = () => {
      setUpdateUserState({
         open: false,
         detail: {},
      });
   };

   const handleOpenUpdateUserDialog = async () => {
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

   return (
      <>
         <Head>
            <title>{'Hyster - Yale'}</title>
         </Head>

         <AppBar className={classes.header__container} position="static">
            <a
               href={`/web-pricing-tools/${
                  userRoleCookies === 'ADMIN' ? `admin/users` : `financial-bookings`
               }`}
               style={{ width: 35, height: 35 }}
            >
               <Image
                  src={smallLogo}
                  width={35}
                  height={35}
                  alt="Hyster-Yale"
                  style={{ padding: 2 }}
               />
            </a>
            <nav className={classes.navigation} role="nav">
               <Button aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}>
                  Orders
               </Button>
               <Button aria-controls="simple-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}>
                  Pricing
               </Button>
            </nav>
            <div
               className={classes.profile__container}
               {...bindTrigger(popupState)}
               data-testid="profile-testid"
            >
               <div style={{ marginRight: 10, fontSize: 16 }}>{userName}</div>
               <AccountCircle style={{ marginRight: 5, fontSize: 20 }} />
            </div>
         </AppBar>

         {renderBookingMenu}
         {renderPricingMenu}

         <Grid
            container
            style={{
               height: heightBody,
               width: '100%',
               maxHeight: 2000,
            }}
         >
            <div className={classes.appLayout__container}>{children}</div>
         </Grid>
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
            {userRoleCookies === 'ADMIN' && (
               <>
                  <Typography
                     style={{ margin: 10, cursor: 'pointer' }}
                     onClick={handleAdminPage}
                     data-testid="user-item-testid"
                     id="logout__testid"
                  >
                     {t('user.adminPage')}
                  </Typography>
               </>
            )}
            <Typography
               style={{ margin: 10, cursor: 'pointer' }}
               onClick={handleOpenUpdateUserDialog}
               data-testid="user-item-testid"
               id="logout__testid"
            >
               {t('user.userDetails')}
            </Typography>
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
         <AppFooter />
         <DialogChangePassword {...changePasswordState} onClose={handleCloseChangePasswordDialog} />
         <DialogUpdateUser
            {...updateUserState}
            setUserName={setUserName}
            onClose={handleCloseUpdateUserDialog}
         />
      </>
   );
};

export { AppLayout };
