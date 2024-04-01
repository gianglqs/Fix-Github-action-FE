import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import '@fontsource/poppins';

const Custom404Page = () => {
   const router = useRouter();

   // Function to handle navigation back to the previous page
   const navigateBack = () => {
      router.back();
   };

   useEffect(() => {
      document.title = '404 - Page Not Found'; // Set the page title
   }, []);
   const logo = require('src/pages/404-page.png');
   const fonts = {
      body: 'Poppins, sans-serif',
   };

   return (
      <section
         style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
         }}
      >
         <div style={{ width: '50%', textAlign: 'center' }}>
            <img alt="logo" style={{ width: 600, alignItems: 'center' }} src={String(logo)} />
            <h1
               style={{
                  fontSize: '60px',
                  fontWeight: '500',
                  color: '#606060',
                  fontFamily: 'Poppins',
                  alignItems: 'center',
                  lineHeight: '72px',
                  marginTop: '10px',
               }}
            >
               Under maintenance
            </h1>
            <p
               style={{
                  fontSize: '20px',
                  fontWeight: '400',
                  lineHeight: '30px',
                  alignItems: 'center',
                  fontFamily: 'Poppins',
                  color: '#777777',
                  marginTop: '-30px',
               }}
            >
               Sorry, the page you are looking for doesn't exist or has been moved.
            </p>
            <div>
               <button
                  style={{
                     padding: '12px 20px',
                     fontSize: '18px',
                     backgroundColor: '#333',
                     fontWeight: '400',
                     lineHeight: '30px',
                     color: '#fff',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                     textDecoration: 'none',
                     position: 'relative',
                     overflow: 'hidden',
                     fontFamily: 'Poppins',
                  }}
                  onClick={navigateBack}
               >
                  Go Back
               </button>

               <Link href="web-pricing-tools/financial-bookings" passHref>
                  <button
                     style={{
                        padding: '12px 20px',
                        fontSize: '18px',
                        backgroundColor: '#e7a800',
                        fontWeight: '400',
                        lineHeight: '30px',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        textDecoration: 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        marginLeft: 20,
                        marginTop: 10,
                        fontFamily: 'Poppins',
                     }}
                  >
                     Home Page
                  </button>
               </Link>
            </div>
         </div>
      </section>
   );
};

<style></style>;

export default Custom404Page;
