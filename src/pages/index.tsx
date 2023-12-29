import { parseCookies } from 'nookies';
import LoginPage from './login';
import axios from 'axios';

export async function getServerSideProps(context) {
   try {
      let cookies = parseCookies(context);
      let token = cookies['token'];
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}oauth/checkTokenOfAdmin`, null, {
         headers: {
            Authorization: 'Bearer ' + token,
         },
      });

      return {
         redirect: {
            destination: '/web-pricing-tools/admin/dashboard',
            permanent: false,
         },
      };
   } catch (error) {
      if (error.response?.status == 403)
         return {
            redirect: {
               destination: '/web-pricing-tools/bookingOrder',
               permanent: false,
            },
         };
      return {
         props: {},
      };
   }
}

function IndexPage() {
   return <LoginPage />;
}

export default IndexPage;
