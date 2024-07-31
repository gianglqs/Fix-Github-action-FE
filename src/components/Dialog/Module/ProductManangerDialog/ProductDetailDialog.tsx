//components
import { ProductImage } from '@/components/App/Image/ProductImage';
import { Dialog, Grid, TextField } from '@mui/material';
import { AppTextField } from '@/components/App';
import { AppDialog } from '../AppDialog/AppDialog';
import ChooseImage from '@/components/App/chooseImage';
//hooks
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
//api
import productApi from '@/api/product.api';
//others
import { imageDialogStore } from '@/store/reducers';
//store
import { productStore, commonStore } from '@/store/reducers';
const ProductDetailDialog: React.FC<any> = (props) => {
   const { open, onClose, model, _series, isEdit } = props;

   const [imageFile, setImageFile] = useState(null); // image data - not link !
   const [updatedDescription, setUpdatedDescription] = useState(null);
   const [enableSubmitForm, setEnableSubmitForm] = useState(true);

   const productList = useSelector(productStore.selectProductList);

   // ======== info product detail ========
   const productDetail = productList.find(
      (product) => product?.series?.series === _series?.series && product.modelCode === model
   );
   const { t } = useTranslation();
   const updateProduct = useForm({
      shouldUnregister: false,
      defaultValues: productDetail?.description,
   });
   const dispatch = useDispatch();

   // if there are any changes -> allow submit
   useEffect(() => {
      if (updatedDescription !== productDetail?.description || imageFile) {
         setEnableSubmitForm(true);
      } else {
         setEnableSubmitForm(false);
      }
   }, [imageFile, updatedDescription]);

   useEffect(() => {
      if (open) {
         if (!productDetail && (model || _series)) {
            productApi.getProductDetail(model, _series?.series).then((rs) => {
               dispatch(productStore.actions.setProductList([JSON.parse(rs?.data)]));
            });
         }
      }
      setUpdatedDescription(productDetail?.description);
   }, [open]);

   const updateForm = new FormData();

   const handleSubmitForm = updateProduct.handleSubmit(async () => {
      updateForm.append('modelCode', productDetail?.modelCode);
      updateForm.append('series', productDetail?.series?.series);

      // if have change image
      imageFile && updateForm.append('image', imageFile);

      // if have change description
      if (updatedDescription !== productDetail.description)
         updateForm.append('description', updatedDescription);

      try {
         await productApi.updateProduct(updateForm);

         //update store
         const newProduct = await productApi
            .getProductDetail(productDetail?.modelCode, productDetail?.series?.series)
            .then((res) => JSON.parse(res?.data));
         console.log(newProduct);
         const newProductList = [...productList];
         const updatedProductIndex = newProductList.findIndex(
            (product) =>
               product.series.series === productDetail?.series?.series &&
               product.modelCode === productDetail?.modelCode
         );
         newProductList[updatedProductIndex] = newProduct;
         dispatch(productStore.actions.setProductList(newProductList));
         //dispatch(productStore.sagaGetList());
         dispatch(commonStore.actions.setSuccessMessage('Update Product successfully!'));
      } catch (error) {
         dispatch(commonStore.actions.setErrorMessage(error?.message));
      }
      handleCloseForm();
   });

   const handleCloseForm = () => {
      setImageFile(null);
      setUpdatedDescription(null);
      onClose();
   };
   const handleOpenImageDialog = (imageURL: string) => {
      dispatch(imageDialogStore.actions.setImageURL(imageURL));
      dispatch(imageDialogStore.actions.openDialog());
   };

   const dialogContent = (
      <Grid container sx={{ padding: '40px' }}>
         <Grid container spacing={3}>
            <Grid item xs={6} style={{ paddingLeft: '15px', overflow: 'hidden' }}>
               {isEdit ? (
                  <ChooseImage
                     image={productDetail?.image}
                     setImage={setImageFile}
                     handleOpenImageDialog={handleOpenImageDialog}
                  />
               ) : (
                  <ProductImage
                     imageUrl={productDetail?.image}
                     style={{
                        objectFit: 'contain',
                        borderRadius: '5px',
                        height: '100%',
                        width: '100%',
                     }}
                     onClick={() => handleOpenImageDialog(productDetail?.image)}
                  />
               )}
            </Grid>
            <Grid spacing={1} item xs={6}>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.models')}
                     value={productDetail?.modelCode}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.brand')}
                     value={productDetail?.brand}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.truckType')}
                     value={productDetail?.truckType}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.plant')}
                     value={productDetail?.plant}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.series')}
                     value={productDetail?.series?.series}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.segment')}
                     value={productDetail?.segmentGroup?.name}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.family')}
                     value={productDetail?.family}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     id="outlined-read-only-input"
                     label={t('table.class')}
                     value={productDetail?.clazz?.clazzName}
                     defaultValue=" "
                     InputProps={{
                        readOnly: true,
                        style: {
                           height: '30px',
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                  />
               </Grid>
               <Grid item xs={12}>
                  <AppTextField
                     id="outlined-read-only-input"
                     label={t('table.description')}
                     value={productDetail?.description}
                     defaultValue=" "
                     rows={3}
                     onChange={(e) => setUpdatedDescription(e.target.value)}
                     InputProps={{
                        readOnly: !isEdit,
                        style: {
                           fontSize: 15,
                        },
                     }}
                     InputLabelProps={{
                        style: {
                           fontSize: 13,
                        },
                     }}
                     margin="dense"
                     multiline
                  />
               </Grid>
            </Grid>
         </Grid>
      </Grid>
   );

   if (!open) return;

   if (isEdit)
      return (
         <AppDialog
            open={open}
            disableOK={!enableSubmitForm}
            onOk={handleSubmitForm}
            onClose={handleCloseForm}
            title={t('updateProduct')}
            okText={t('button.save')}
            closeText={t('button.close')}
            fullWidth={true}
            PaperProps={{ sx: { borderRadius: '10px' } }}
            maxWidth="md"
            draggable={false}
         >
            {dialogContent}
         </AppDialog>
      );

   return (
      <AppDialog
         title={t('title.detailProduct')}
         open={open}
         onClose={handleCloseForm}
         fullWidth={true}
         displayOK={false}
         maxWidth="md"
         draggable={false}
         PaperProps={{ sx: { borderRadius: '10px' } }}
      >
         {dialogContent}
      </AppDialog>
   );
};

export { ProductDetailDialog };
