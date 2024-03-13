import '@/theme/_global.css';
import { wrapper } from '@/store/config';
import type { AppProps } from 'next/app';
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

function MyApp({ Component, pageProps }: AppProps) {
   useEffect(() => {
      const jssStyles = document.querySelector('#jss-server-side');
      if (jssStyles) {
         jssStyles.parentElement.removeChild(jssStyles);
      }

      const defaultLocale =
         document.cookie
            .split('; ')
            .find((row) => row.startsWith('defaultLocale='))
            ?.split('=')[1] || 'en';
      i18next.changeLanguage(defaultLocale);
   });

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
