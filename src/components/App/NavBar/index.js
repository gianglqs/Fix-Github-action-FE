const { useRouter } = require('next/router');
import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import List from '@mui/material/List';
import { useTranslation } from 'react-i18next';

const NavBar = () => {
   const router = useRouter();
   const { t } = useTranslation();

   const navOptions = {
      'financial-bookings': t('navBar.dashboard'),
      'competitor-colors': t('navBar.competitorColors'),
      'manage-competitor': t('navBar.manageIndicator'),
      users: t('navBar.users'),
      'historical-import': t('navBar.historicalImporting'),
      'import-tracking': t('navBar.importTracking'),
      wiki: t('navBar.help'),
   };

   const renderOptions = () => {
      const otherOptions = _.keysIn(navOptions);

      const navBar = _.map(otherOptions, (name) => (
         <Link
            href={
               name === 'wiki'
                  ? `${process.env.WIKI_URL}`
                  : `/web-pricing-tools/${
                       name != 'financial-bookings' ? `admin/${name}` : `${name}`
                    }`
            }
            sx={{
               textDecoration: 'none',
            }}
         >
            <ListItemButton>
               <ListItemIcon>
                  <DashboardIcon />
               </ListItemIcon>
               <Typography
                  variant="body1"
                  fontWeight="fontWeightMedium"
                  color={
                     router.pathname ===
                     `/web-pricing-tools/${
                        name != 'financial-bookings' ? `admin/${name}` : `${name}`
                     }`
                        ? '#e7a800'
                        : '#a5a5a5'
                  }
                  sx={{
                     fontSize: 15,
                  }}
               >
                  {navOptions[name]}
               </Typography>
            </ListItemButton>
         </Link>
      ));
      return navBar;
   };

   return (
      <>
         <List component="nav">{renderOptions()}</List>
      </>
   );
};

export { NavBar };
