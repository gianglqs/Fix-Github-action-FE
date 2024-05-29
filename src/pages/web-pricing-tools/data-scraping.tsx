import { AppLayout, AppTextField, DataTable } from '@/components';
import { Button, Grid, Backdrop, CircularProgress, Dialog } from '@mui/material';
import _ from 'lodash';

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import dataScrapingApi from '@/api/data-scraping.api';
import { commonStore } from '@/store/reducers';
import { useTranslation } from 'react-i18next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function DataScraping() {
   const dispatch = useDispatch();
   const { t } = useTranslation();

   const [url, setUrl] = useState({ value: '', error: false });
   const [productList, setProductList] = useState([]);
   const [loading, setLoading] = useState(false);

   const handleScrape = async () => {
      if (url.value == '') {
         setUrl({ value: '', error: true });
         return;
      }

      setLoading(true);

      await dataScrapingApi
         .scrapeData(url.value)
         .then((response) => {
            const data = response.data;
            const products = JSON.parse(String(data)).productList;
            setProductList(products);
         })
         .catch((error) => {
            dispatch(commonStore.actions.setErrorMessage('Technical issue on our end. We apologize for the inconvenience. Please try again later or contact our support team for assistance.'));
         })
         .finally(() => {
            setLoading(false);
         });
   };

   const handleChangeUrl = (value) => {
      setUrl({ value: value, error: false });
   };

   const columns = [
      {
         field: 'productName',
         flex: 0.8,
         minWidth: 200,
         headerName: t('table.productName'),
         headerAlign: 'center',
         align: 'left',
      },
      {
         field: 'image',
         flex: 0.8,
         minWidth: 200,
         headerName: t('table.image'),
         headerAlign: 'center',
         align: 'center',
         renderCell(params) {
            return (
               <span>
                  <img
                     src={`${params?.row.image}`}
                     style={{
                        height: 40,
                        width: 50,
                     }}
                     onClick={() => handleOpenImageDialog(params?.row.image)}
                  />
               </span>
            );
         },
      },
      {
         field: 'price',
         flex: 0.8,
         minWidth: 200,
         headerName: t('table.price'),
         headerAlign: 'center',
         align: 'right',
         renderCell(params) {
            return <span>{params?.row.price.toLocaleString()}</span>;
         },
      },
      {
         field: 'currency',
         flex: 0.8,
         minWidth: 200,
         headerName: t('table.currency'),
         headerAlign: 'center',
         align: 'center',
      },
   ];

   const [imageDialogState, setImageDialogState] = useState({
      open: false,
      imageUrl: null,
   });

   const handleOpenImageDialog = (imageUrl) => {
      setImageDialogState({
         open: true,
         imageUrl: imageUrl,
      });
   };

   const handleCloseImageDialog = () => {
      setImageDialogState({
         open: false,
         imageUrl: null,
      });
   };

   return (
      <>
         <AppLayout entity="data-scraping">
            <Grid container spacing={1}>
               <Grid item xs={3} sx={{ zIndex: 10, height: 70, marginTop: 1 }}>
                  <AppTextField
                     value={url.value}
                     error={url.error}
                     helperText="This field cannot be blank"
                     required
                     name="url"
                     label="URL"
                     placeholder="Enter an URL"
                     onChange={(e) => handleChangeUrl(e.target.value)}
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25, marginTop: 1 }}>
                  <Button
                     variant="contained"
                     sx={{ width: '45%', height: 24 }}
                     onClick={handleScrape}
                  >
                     {t('button.scrape')}
                  </Button>
               </Grid>
            </Grid>
            <Grid container sx={{ marginTop: 1 }}>
               <DataTable
                  hideFooter
                  disableColumnMenu
                  tableHeight={750}
                  rowHeight={50}
                  rows={productList}
                  columns={columns}
                  sx={{ borderBottom: '1px solid #a8a8a8', borderTop: '1px solid #a8a8a8' }}
               />
               <Backdrop
                  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                  open={loading}
               >
                  <CircularProgress color="inherit" />
               </Backdrop>{' '}
            </Grid>
            <ShowImageDialog {...imageDialogState} onClose={handleCloseImageDialog} />
         </AppLayout>
      </>
   );
}

function ShowImageDialog(props) {
   const { open, imageUrl, onClose } = props;
   const [image, setImage] = useState();
   useEffect(() => {
      setImage(imageUrl);
   }, [imageUrl]);
   return (
      <Dialog maxWidth="lg" open={open} onClose={onClose}>
         <img src={image} />
      </Dialog>
   );
}
