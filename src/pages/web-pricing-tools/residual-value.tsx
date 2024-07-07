import { useCallback, useContext, useEffect, useState } from 'react';

import { commonStore, importFailureStore, residualValueStore } from '@/store/reducers';
import { formatNumberTwoPercentDigit } from '@/utils/formatCell';
import { useDispatch, useSelector } from 'react-redux';

import ClearIcon from '@mui/icons-material/Clear';
import { Backdrop, Box, Button, CircularProgress, ListItem, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { setCookie } from 'nookies';
import { useDropzone } from 'react-dropzone';

import { AppAutocomplete, AppLayout, AppNumberField } from '@/components';

import _ from 'lodash';

import residualValueApi from '@/api/residualValue.api';
import { ProductImage } from '@/components/App/Image/ProductImage';
import { LogImportFailureDialog } from '@/components/Dialog/Module/importFailureLogDialog/ImportFailureLog';
import { UserInfoContext } from '@/provider/UserInfoContext';
import { boxStyle } from '@/theme/paperStyle';
import { ResidualValueDataFilter } from '@/types/defaultValue';
import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { convertServerTimeToClientTimeZone } from '@/utils/convertTime';
import { defaultValueFilterResidualValue } from '@/utils/defaultValues';
import { extractTextInParentheses } from '@/utils/getString';
import { createAction } from '@reduxjs/toolkit';
import { GetServerSidePropsContext } from 'next';
import { useTranslation } from 'react-i18next';
import { downloadFileByURL } from '@/utils/handleDownloadFile';
import { RESIDUAL_VALUE } from '@/utils/modelType';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}
interface FileChoosed {
   name: string;
}

export default function ResidualValue() {
   const dispatch = useDispatch();
   const { t } = useTranslation();
   useEffect(() => {
      createAction(`residualValue/reloadModelCode`);
   }, []);

   const listResidualValue = useSelector(residualValueStore.selectListResidualValue);

   const initDataFilterModelTypeAndBrand = useSelector(
      residualValueStore.selectInitDataFilterModelTypeAndBrand
   );
   const initDataFilterModelCode = useSelector(residualValueStore.selectInitDataFilterModelCode);

   const dataFilter = useSelector(residualValueStore.selectDataFilter);

   const serverTimeZone = useSelector(residualValueStore.selectServerTimeZone);
   const serverLastUpdatedTime = useSelector(residualValueStore.selectLastUpdatedTime);
   const serverLastUpdatedBy = useSelector(residualValueStore.selectLastUpdatedBy);
   const exampleFile = useSelector(residualValueStore.selectExampleUploadFile);

   const [clientLatestUpdatedTime, setClientLatestUpdatedTime] = useState('');

   const [selectedResidualValue, setSelectedResidualValue] = useState([]);
   const [image, setImage] = useState(undefined);

   //  const [uploadedFile, setUploadedFile] = useState({ name: '' });
   const [uploadedFile, setUploadedFile] = useState<FileChoosed[]>([]);
   // use importing to control spiner
   const [loading, setLoading] = useState(false);

   // import failure dialog
   const importFailureDialogDataFilter = useSelector(importFailureStore.selectDataFilter);

   const handleChangeDataFilter = (option, field) => {
      let newDataFilter;
      if (_.includes(['modelType', 'brand'], field)) {
         newDataFilter = { ...dataFilter, [field]: option, modelCode: null };
      } else {
         newDataFilter = { ...dataFilter, [field]: option };
      }
      dispatch(residualValueStore.actions.setDataFilter(newDataFilter));
      dispatch(residualValueStore.reloadModelCode());
      if (_.includes(['modelCode'], field)) {
         dispatch(residualValueStore.getDataResidualValue());
      }
   };

   const handleUploadFile = async (file) => {
      let formData = new FormData();
      formData.append('file', file);
      residualValueApi
         .importDataResidualValue(formData)
         .then((response) => {
            setLoading(false);
            handleWhenImportSuccessfully(response);
         })
         .catch((error) => {
            // stop spiner
            setLoading(false);
            //show message
            dispatch(commonStore.actions.setErrorMessage(error.message));
         });
   };

   const handleWhenImportSuccessfully = (res) => {
      //show message
      dispatch(commonStore.actions.setSuccessMessage(res.data.message));

      // update importFailureState, prepare to open dialog
      dispatch(
         importFailureStore.actions.setDataFilter({
            ...importFailureDialogDataFilter,
            fileUUID: res.data.data,
         })
      );

      dispatch(
         importFailureStore.actions.setImportFailureDialogState({
            overview: extractTextInParentheses(res.data.message),
         })
      );

      dispatch(residualValueStore.sagaGetList());
   };

   const handleImport = () => {
      if (uploadedFile.length > 0) {
         // resert message
         setLoading(true);
         handleUploadFile(uploadedFile[0]);
      } else {
         //TODO: need to put this message into language file
         dispatch(commonStore.actions.setErrorMessage('Please select file to upload first'));
      }
   };

   const handleRemove = (fileName) => {
      const updateUploaded = uploadedFile.filter((file) => file.name != fileName);
      setUploadedFile(updateUploaded);
   };

   const appendFileIntoList = (file) => {
      setUploadedFile((prevFiles) => [...prevFiles, file]);
   };

   // handle button to clear all filters
   const handleClearAllFilters = () => {
      setSelectedResidualValue([]);
      setImage(undefined);
      dispatch(residualValueStore.actions.setDataFilter(defaultValueFilterResidualValue));
   };

   //TODO: this should be dynamic, getting from apis
   const optionYearFilter = [
      { value: '2' },
      { value: '3' },
      { value: '4' },
      { value: '5' },
      { value: '6' },
      { value: '7' },
      { value: '8' },
      { value: '9' },
      { value: '10' },
   ];

   let heightComponentExcludingTable = 193;
   const { userRole } = useContext(UserInfoContext);
   const [userRoleState, setUserRoleState] = useState('');

   if (userRoleState === 'ADMIN') {
      heightComponentExcludingTable = 175;
   }
   useEffect(() => {
      setUserRoleState(userRole);
   });

   const showResidualValue = () => {
      selectedResidualValue.sort((n1, n2) => n1.id.hours - n2.id.hours);
      return selectedResidualValue.map((residualValue) => {
         return (
            <Box sx={{ ...boxStyle, width: 200 }} key={residualValue.id}>
               <p style={{ fontWeight: 900, fontSize: 16, margin: 0 }}>
                  {residualValue.id.hours} hours
               </p>
               <Typography>{`${formatNumberTwoPercentDigit(residualValue.residualPercentage * 100)} %`}</Typography>
               {dataFilter?.price !== 0 && (
                  <Typography>{`$ ${formatNumberTwoPercentDigit(residualValue.residualPercentage * dataFilter?.price)}`}</Typography>
               )}
            </Box>
         );
      });
   };

   const handleChangeYear = (year: any) => {
      const newDataFilter = { ...dataFilter, year };
      dispatch(residualValueStore.actions.setDataFilter(newDataFilter));
      selectResidualValueByYears(year);
   };

   const selectResidualValueByYears = (years: string) => {
      setSelectedResidualValue(
         listResidualValue.filter((residualValue) => residualValue.id.yearOfUse == years)
      );
   };

   useEffect(() => {
      handleChangeYear(dataFilter.year);
      setImage(listResidualValue[0]?.id.product.image);
      convertTimezone();
   }, [listResidualValue]);

   // show latest updated time
   const convertTimezone = () => {
      if (serverLastUpdatedTime && serverTimeZone) {
         setClientLatestUpdatedTime(
            convertServerTimeToClientTimeZone(serverLastUpdatedTime, serverTimeZone)
         );
      }
   };

   return (
      <>
         <AppLayout entity="residualValue">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.modelType}
                     options={initDataFilterModelTypeAndBrand.modelTypes}
                     label={t('filters.modelType')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option?.value, 'modelType')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={1.2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.brand}
                     options={initDataFilterModelTypeAndBrand.brands}
                     label={t('filters.brand')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option?.value, 'brand')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={1} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.modelCode}
                     options={initDataFilterModelCode}
                     label={t('filters.model')}
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option?.value, 'modelCode')
                     }
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppNumberField
                     value={dataFilter.price}
                     onChange={(e) => handleChangeDataFilter(Number(e.value), 'price')}
                     name="freightAdj"
                     label={`${t('table.averageSellingPrice')}`}
                     placeholder={`${t('table.averageSellingPrice')}`}
                     prefix="$"
                  />
               </Grid>

               <Grid item xs={1} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={dataFilter.year}
                     options={optionYearFilter}
                     label={t('filters.year')}
                     onChange={(e, option) => handleChangeYear(option.value)}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={1}>
                  <Button
                     variant="contained"
                     onClick={handleClearAllFilters}
                     sx={{ width: '100%', height: 24 }}
                  >
                     {t('button.clear')}
                  </Button>
               </Grid>
            </Grid>
            {userRoleState === 'ADMIN' && (
               <Grid container spacing={1} sx={{ marginTop: '3px' }}>
                  <Grid item xs={1}>
                     <UploadFileDropZone
                        uploadedFile={uploadedFile}
                        setUploadedFile={appendFileIntoList}
                        handleUploadFile={handleUploadFile}
                     />
                  </Grid>
                  <Grid item xs={1}>
                     <Button
                        variant="contained"
                        onClick={handleImport}
                        sx={{ width: '100%', height: 24 }}
                     >
                        {t('button.import')}
                     </Button>
                  </Grid>
                  <Typography
                     sx={{
                        color: 'blue',
                        fontSize: 15,
                        margin: '0 30px 0 10px',
                        cursor: 'pointer',
                        marginTop: '10px',
                     }}
                     onClick={() => downloadFileByURL(exampleFile[RESIDUAL_VALUE])}
                  >
                     {t('link.getExampleUploadFile')}
                  </Typography>
                  <Grid item xs={4} sx={{ display: 'flex' }}>
                     {uploadedFile &&
                        uploadedFile.map((file) => (
                           <ListItem
                              sx={{
                                 padding: 0,
                                 backgroundColor: '#e3e3e3',
                                 width: '75%',
                                 display: 'flex',
                                 justifyContent: 'space-between',
                                 paddingLeft: '10px',
                                 borderRadius: '3px',
                                 marginLeft: '4px',
                                 height: '26px',
                              }}
                           >
                              <span
                                 style={{
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                 }}
                              >
                                 {file.name}
                              </span>
                              <Button
                                 onClick={() => handleRemove(file.name)}
                                 sx={{ width: '20px' }}
                              >
                                 <ClearIcon />
                              </Button>
                           </ListItem>
                        ))}
                  </Grid>
               </Grid>
            )}

            <Grid
               container
               sx={{ height: `calc(100vh - ${heightComponentExcludingTable}px)`, marginTop: 2 }}
            >
               <Grid xs={5} sx={{ height: '100%' }}>
                  {/* Container image */}
                  <Box
                     sx={{
                        height: '80%',
                        border: '1px solid black',
                        marginTop: '5px',
                        borderRadius: '3px',
                        marginRight: '10px',
                     }}
                  >
                     {image !== undefined && (
                        <ProductImage
                           imageUrl={image}
                           style={{
                              objectFit: 'contain',
                              height: '100%',
                              width: '100%',
                           }}
                        />
                     )}
                  </Box>
                  <Typography variant="h5" align="center" sx={{ marginTop: '10px' }}>
                     ModelCode: {dataFilter.modelCode}
                  </Typography>
                  <Typography sx={{ bottom: '30px', position: 'absolute' }}>
                     {t('table.lastUpdatedBy')} {serverLastUpdatedBy} {t('table.lastUpdatedAt')}{' '}
                     {clientLatestUpdatedTime}
                  </Typography>
               </Grid>
               <Grid
                  xs={7}
                  sx={{
                     display: 'flex',
                     flexWrap: 'wrap',
                     alignContent: 'flex-start',
                     overflow: 'hidden',
                     overflowY: 'scroll',
                     height: `calc(100vh - ${heightComponentExcludingTable}px)`,
                  }}
               >
                  {
                     /* container residualValue */
                     showResidualValue()
                  }
               </Grid>
            </Grid>
         </AppLayout>
         <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={loading}
         >
            <CircularProgress color="inherit" />
         </Backdrop>
         <LogImportFailureDialog />
      </>
   );
}

// open file and check list column is exit
//function checkColumn();

function UploadFileDropZone(props) {
   const { t } = useTranslation();
   const onDrop = useCallback(
      (acceptedFiles) => {
         acceptedFiles.forEach((file) => {
            const reader = new FileReader();

            reader.onabort = () => console.log('file reading was aborted');
            reader.onerror = () => console.log('file reading has failed');
            reader.onload = () => {
               if (props.uploadedFile.length + acceptedFiles.length >= 2) {
                  dispatch(commonStore.actions.setErrorMessage('Too many files'));
               } else {
                  props.setUploadedFile(file);
               }
            };
            reader.readAsArrayBuffer(file);
         });
      },
      [props.uploadedFile, props.setUploadedFile]
   );

   const { getRootProps, getInputProps, open, fileRejections } = useDropzone({
      noClick: true,
      onDrop,
      maxSize: 10485760, // < 10MB
      maxFiles: 1,
      accept: {
         'excel/xlsx': ['.xlsx'],
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
         <Button
            type="button"
            onClick={open}
            variant="contained"
            sx={{ width: '100%', height: 24 }}
         >
            {t('button.selectFile')}{' '}
         </Button>
      </div>
   );
}
