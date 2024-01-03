const { useRouter } = require('next/router');
import Link from '@mui/material/Link';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Typography from '@mui/material/Typography';
import _ from 'lodash';
import List from '@mui/material/List';

const NavBar = () => {
   const router = useRouter();

   const navOptions = {
      bookingOrder: 'Dashboard',
      competitors: 'Competitors',
      dashboard: 'Users',
   };

   const renderOptions = () => {
      const otherOptions = _.keysIn(navOptions);

      const navBar = _.map(otherOptions, (name) => (
         <Link
            href={`/web-pricing-tools/${name != 'bookingOrder' ? `admin/${name}` : `${name}`}`}
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
                     `/web-pricing-tools/${name != 'bookingOrder' ? `admin/${name}` : `${name}`}`
                        ? '#e7a800'
                        : '#000000'
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
