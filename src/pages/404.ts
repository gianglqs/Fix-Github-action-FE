import { PATH_ADMIN_USER, PATH_BOOKING } from '@/Path/frontend';
import { commonStore } from '@/store/reducers';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

export default function handleRedirectToBasePage() {
   const router = useRouter();
   const dispatch = useDispatch();
   const { t } = useTranslation();

   useEffect(() => {
      const currentURL = window.location.pathname;
      dispatch(commonStore.actions.setNotificationMessage(t('commonErrorMessage.pageNotFound')));
      if (currentURL.includes('admin')) {
         router.push(PATH_ADMIN_USER);
      } else {
         router.push(PATH_BOOKING);
      }
   });
}
