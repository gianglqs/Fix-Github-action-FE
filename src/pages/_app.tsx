import '@/theme/_global.css';
import { wrapper } from '@/store/config';
import appTheme from '@/theme/appTheme';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import AppMessagePopup from '@/components/App/MessagePopup';
import { useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import UserInfoProvider from '@/provider/UserInfoContext';
import '../i18n/locales/config';
import i18next from 'i18next';

import { GetServerSidePropsContext } from 'next';
import { parseCookies } from 'nookies';

MyApp.getInitialProps = async ({
   Component,
   ctx,
}: {
   Component: any;
   ctx: GetServerSidePropsContext;
}) => {
   const cookies = parseCookies(ctx);
   const defaultLocate = cookies['defaultLocale'];
   let pageProps = {};
   if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
   }

   return { pageProps, defaultLocate: defaultLocate };
};

function MyApp({ Component, pageProps, defaultLocate }) {
   useEffect(() => {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles) {
         jssStyles.parentElement.removeChild(jssStyles);
      }
   });
   i18next.changeLanguage(defaultLocate);

   return (
      <ThemeProvider theme={appTheme}>
         <CssBaseline />
         <AppMessagePopup />
         <LocalizationProvider dateAdapter={AdapterDateFns}>
            <UserInfoProvider>
               <Component {...pageProps} />
            </UserInfoProvider>
         </LocalizationProvider>
      </ThemeProvider>
   );
}

export default wrapper.withRedux(MyApp);
