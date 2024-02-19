import LoginPage from './login';
import { checkTokenBeforeLoadPageLogin } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPageLogin(context);
}

function IndexPage() {
   const router = useRouter();
   useEffect(() => {
      router.push('/login');
   });
}

export default IndexPage;
