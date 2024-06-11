import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { commonStore } from '@/store/reducers';
import { Button, CircularProgress } from '@mui/material';

import { AppLayout } from '@/components';
import Grid from '@mui/material/Grid';

import {
   Chart as ChartJS,
   LinearScale,
   PointElement,
   Tooltip,
   LineElement,
   Legend,
   CategoryScale,
   Title,
} from 'chart.js';
import ChartAnnotation from 'chartjs-plugin-annotation';
import _ from 'lodash';

ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Tooltip,
   Legend,
   Title,
   ChartAnnotation
);
import { useDropzone } from 'react-dropzone';

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import AppBackDrop from '@/components/App/BackDrop';
import { useTranslation } from 'react-i18next';
export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

const defaultDataFilterBubbleChart = {
   regions: '',
   countries: [],
   classes: [],
   categories: [],
   series: [],
};

export default function IndicatorsV2() {
   const {t} = useTranslation();

   const currentYear = new Date().getFullYear();

   return (
      <>

            <div
               style={{
                  height: '100%',
                  width: '100%',
                  backgroundColor: 'rgba(0,0,0, 0.3)',
                  position: 'absolute',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
               }}
            >
               <CircularProgress
                  color="info"
                  size={60}
                  sx={{
                     position: 'relative',
                  }}
               />
            </div>
         <AppLayout entity="indicator">
            <Grid
               container
               spacing={1}
               justifyContent="center"
               alignItems="center"
               sx={{ margin: '20px 0' }}
            >
             

                  <Grid item xs={1.5} sx={{ zIndex: 10 }}>
                     <Button
                        variant="contained"
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.filter')}
                     </Button>
                  </Grid>
                  <Grid item xs={1.5}>
                     <Button
                        variant="contained"
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.clear')}
                     </Button>
                  </Grid>
               </Grid>
               <Grid
                  item
                  xs={9}
                  sx={{
                     height: '55vh',
                     width: 'fit-content',
                     position: 'relative',
                  }}
               >
                  <AppBackDrop  hightHeaderTable={'35px'} bottom={'0px'} />
               </Grid>
          
         </AppLayout>
      </>
   );
}

function UploadFileDropZone(props) {
   const onDrop = useCallback((acceptedFiles) => {
      acceptedFiles.forEach((file) => {
         const reader = new FileReader();

         reader.onabort = () => console.log('file reading was aborted');
         reader.onerror = () => console.log('file reading has failed');
         reader.onload = () => {
            // Do whatever you want with the file contents
         };
         reader.readAsArrayBuffer(file);
         props.handleUploadFile(file);
      });
   }, []);

   const { getRootProps, getInputProps, open, fileRejections } = useDropzone({
      noClick: true,
      onDrop,
      maxSize: 16777216,
      maxFiles: 1,
      accept: {
         'excel/xlsx': ['.xlsx', '.xlsb'],
      },
   });
   const dispatch = useDispatch();
   const isFileInvalid = fileRejections.length > 0 ? true : false;
   if (isFileInvalid) {
      const errors = fileRejections[0].errors;
      dispatch(
         commonStore.actions.setErrorMessage(
            `${errors[0].message} ${_.isNil(errors[1]) ? '' : `or ${errors[1].message}`}`
         )
      );
      fileRejections.splice(0, 1);
   }

   return (
      <div {...getRootProps()}>
         <input {...getInputProps()} />
         <Button type="button" onClick={open} variant="contained" sx={props.sx}>
            {props.buttonName}
         </Button>
      </div>
   );
}
