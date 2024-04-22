import Custom404Page from './error404';
import Custom500Page from './error500';

function Error({ statusCode }) {
   switch (statusCode) {
      case 500:
         return <Custom500Page />;
      default:
         return <Custom404Page />;
   }
}
export async function getServerSideProps({ res, err }) {
   const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
   if (statusCode === 500) {
      return {
         props: { statusCode },
      };
   }
}
export default Error;

// Error.getInitialProps = ({ res, err }) => {
//    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
//    return { statusCode };
// };

// export default Error;
