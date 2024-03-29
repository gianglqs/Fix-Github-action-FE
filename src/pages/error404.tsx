import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect } from 'react';

const Custom404Page = () => {
   const router = useRouter();

   // Function to handle navigation back to the previous page
   const navigateBack = () => {
      router.back();
   };

   useEffect(() => {
      document.title = '404 - Page Not Found'; // Set the page title
   }, []);

   return (
      <section
         style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            paddingLeft: '205px',
         }}
      >
         <div style={{ width: '50%', textAlign: 'left', marginRight: '2rem' }}>
            <h1
               style={{
                  fontSize: 36,
                  fontWeight: 600,
                  color: '#2d2b2b',
                  marginTop: '2 rem',
                  fontFamily: 'monospace',
               }}
            >
               Uh Ohh!
            </h1>
            <p
               style={{
                  fontSize: 20,
                  marginTop: '1rem',
                  lineHeight: 1.5,
                  fontFamily: 'monospace',
               }}
            >
               We couldn't find the page that you are looking for :(
            </p>
            <div>
               <button
                  style={{
                     padding: '12px 20px',
                     fontSize: '18px',
                     backgroundColor: '#333',
                     color: '#fff',
                     border: 'none',
                     borderRadius: '4px',
                     cursor: 'pointer',
                     transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                     textDecoration: 'none',
                     position: 'relative',
                     overflow: 'hidden',
                     fontFamily: 'monospace',
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
                        fontFamily: 'monospace',
                     }}
                  >
                     Home Page
                  </button>
               </Link>
            </div>
         </div>

         <img
            // src="https://github.com/smthari/404-page-using-html-css/blob/Starter/Images/404.png?raw=true"
            src="https://github.com/CodMark/404-error-page-not-found-using-html-amd-css/blob/main/gifs.gif?raw=true"
            alt="home image"
            style={{
               height: '80vh',
               animation: 'MoveUpDown 2s ease-in-out infinite alternate-reverse both',
            }}
         />
      </section>
   );
};

<style></style>;

export default Custom404Page;
