import { useEffect, useMemo } from 'react';
import useStyles from './styles';

import { Router, useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import _ from 'lodash';

import { createAction } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import { AccountCircle } from '@mui/icons-material';
import { AppBar, Grid, Popover, Typography } from '@mui/material';
import { usePopupState, bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { AppLayoutProps } from './type';
import AppFooter from '../Footer';
import { destroyCookie, parseCookies } from 'nookies';

const AppLayout: React.FC<AppLayoutProps> = (props) => {
   const { children, entity, heightBody } = props;
   const classes = useStyles();

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

   useEffect(() => {
      dispatch(getListAction());
   }, [getListAction, router.query]);

   useEffect(() => {
      return () => {
         dispatch(resetStateAction());
      };
   }, [router.pathname]);

   const menuObj = {
      bookingOrder: 'Financial Bookings',
      shipment: 'Financial Shipments',
      margin_analysis: 'Margin Analysis',
      indicators: 'Indicators',
      adjustment: 'Adjustment of Cost Indicators',
      trends: 'Trends',
      outlier: 'Outliers',
      report: 'Reports',
   };

   const renderMenu = () => {
      const otherOptions = _.keysIn(menuObj);
      return _.map(otherOptions, (name) => (
         <Link
            href={`/web-pricing-tools/${name}`}
            style={{ textDecoration: 'none', cursor: 'pointer', color: '#000' }}
         >
            <Typography
               variant="body1"
               fontWeight="fontWeightMedium"
               className={classes.label}
               color={router.pathname === `/${name}` ? '#e7a800' : ''}
            >
               {menuObj[name]}
            </Typography>
         </Link>
      ));
   };

   const handleLogOut = () => {
      try {
         destroyCookie(null, 'token', { path: '/' });
         router.push('/login');
      } catch (err) {
         console.log(err);
      }
   };

   const handleAdminPage = () => {
      try {
         router.push('/web-pricing-tools/admin/dashboard');
      } catch (err) {
         console.log(err);
      }
   };

   return (
      <>
         <Head>
            <title>{'Hyster - Yale'}</title>
         </Head>
         <AppBar className={classes.header__container} position="static">
            <nav className={classes.navigation} role="nav">
               {renderMenu()}
            </nav>
            <div
               className={classes.profile__container}
               {...bindTrigger(popupState)}
               data-testid="profile-testid"
            >
               <AccountCircle style={{ marginRight: 5, fontSize: 20 }} />
            </div>
         </AppBar>
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
                     Admin Page
                  </Typography>
               </>
            )}
            <Typography
               style={{ margin: 10, cursor: 'pointer' }}
               onClick={handleLogOut}
               data-testid="user-item-testid"
               id="logout__testid"
            >
               Log out
            </Typography>
         </Popover>
         <AppFooter />
      </>
   );
};

export { AppLayout };
