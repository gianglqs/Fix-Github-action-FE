import { PATH_LOGIN } from '@/Path/frontend';
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
      router.push(PATH_LOGIN);
   });
}

export default IndexPage;
