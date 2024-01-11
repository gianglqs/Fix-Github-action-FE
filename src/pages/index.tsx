import LoginPage from './login';
import { checkTokenBeforeLoadPageLogin } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPageLogin(context);
}

function IndexPage() {
   return <LoginPage />;
}

export default IndexPage;
