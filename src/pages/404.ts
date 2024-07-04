import { PATH_ADMIN_USER, PATH_BOOKING } from '@/Path/frontend';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function handleRedirectToBasePage() {
   const router = useRouter();

   useEffect(() => {
      const currentURL = window.location.pathname;

      if (currentURL.includes('admin')) {
         router.push(PATH_ADMIN_USER);
      } else {
         router.push(PATH_BOOKING);
      }
   });
}
