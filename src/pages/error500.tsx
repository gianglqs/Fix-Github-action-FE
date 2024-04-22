import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';
import '@fontsource/poppins';

const Custom500Page = () => {
   const router = useRouter();

   // Function to handle navigation back to the previous page
   const navigateBack = () => {
      router.back();
   };

   const navigateHomepage = () => {
      window.location.href = '/web-pricing-tools/financial-bookings';
   };

   useEffect(() => {
      document.title = '500 - Server Error'; // Set the page title
   }, []);
   const logo = require('src/pages/images/500-page.png');
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
            <img alt="logo" style={{ width: 400, alignItems: 'center' }} src={String(logo)} />
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
               Sorry, this page is under maintenance. Kindly be patient and try again
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
                  onClick={navigateHomepage}
               >
                  Home Page
               </button>
            </div>
         </div>
      </section>
   );
};

<style></style>;

export default Custom500Page;
