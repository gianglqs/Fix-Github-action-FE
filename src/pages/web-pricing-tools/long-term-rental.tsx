import React from 'react';
//components
import { AppLayout, AppTextField, AppNumberField, AppAutocomplete } from '@/components';
import { Button, Typography } from '@mui/material';
import { Grid, Paper } from '@mui/material';
import { Box, Divider } from '@mui/material';
//libs
import _ from 'lodash';
import { NumberSchema } from 'yup';
//hooks
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//store
import { longTermRentalStore } from '@/store/reducers';
//api
import longTermRentalApi from '@/api/longTermRental.api';
//others
import { mappingFiltersToOptionValues } from '@/utils/mapping';
import { defaultValueSelectedFilterLongTermRental } from '@/utils/defaultValues';
const LongTermRentalSection = () => {
   const [discountPercent, setDiscountPercent] = useState('' as any);
   const dataFilter = {} as any;
   const initDataFilter = {} as any;
   const { t } = useTranslation();
   const dispatch = useDispatch();
   const [inputValues, setInputValues] = useState({} as any);
   //event handling
   const handleChangeInputValue = ({ value }, field) => {
      setInputValues({ ...inputValues, [field]: Number(value) });
   };
   //selector
   const { cost, streetPriceMargin, primaryTerm, customerLoanRatePercentage } = useSelector(
      longTermRentalStore.selectGeneralInputValues
   );
   const {
      battery = 0,
      charger = 0,
      localFit = 0,
      telemetry = 0,
      freight = 0,
      importDutyAndCustomsClearance = 0,
      miscellaneous = 0,
   } = inputValues;
   console.log(inputValues);
   console.log(
      battery,
      charger,
      localFit,
      telemetry,
      freight,
      importDutyAndCustomsClearance,
      miscellaneous
   );
   //calculation values
   const truckPrice = (1 + streetPriceMargin) * cost || 0;
   console.log(
      truckPrice,
      battery,
      charger,
      localFit,
      telemetry,
      freight,
      importDutyAndCustomsClearance,
      miscellaneous
   );
   const totalTruckPrice =
      truckPrice +
      battery +
      charger +
      localFit +
      telemetry +
      freight +
      importDutyAndCustomsClearance +
      miscellaneous;
   console.log(totalTruckPrice);
   return (
      <Grid
         item
         sx={{
            flex: 1,
            backgroundColor: '#fffff7',
            borderRadius: 5,
            boxShadow: 3,
            padding: 2,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 1,
         }}
      >
         <Typography
            sx={{
               fontSize: 16,
               fontWeight: 'bold',
               display: 'block',
            }}
         >
            {t('longTermRental.firstLifeTitle')}
         </Typography>
         <Box sx={{ paddingY: 4, display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.monthlyRentalPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     defaultValue={0}
                     value={inputValues.monthlyRentalPrice}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'monthlyRentalPrice');
                     }}
                     suffix="%"
                     name="monthlyRentalPrice"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
                  marginTop: 3,
               }}
            >
               <Typography sx={{ fontWeight: 'bold' }}>Model</Typography>
               <Typography sx={{ fontWeight: 'bold' }}>Example</Typography>
            </Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.truckPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={truckPrice} onChange={(e) => {}} disabled />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.battery')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.battery}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'battery');
                     }}
                     name="battery"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.charger')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.charger}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'charger');
                     }}
                     name="charger"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.localFit')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.localFit}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'localFit');
                     }}
                     name="localFit"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.telemetry')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.telemetry}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'telemetry');
                     }}
                     name="telemetry"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.freight')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.freight}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'freight');
                     }}
                     name="freight"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.importDutyAndCustomsClearance')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.importDutyAndCustomsClearance}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'importDutyAndCustomsClearance');
                     }}
                     name="importDutyAndCustomsClearance"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.miscellaneous')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.miscellaneous}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'miscellaneous');
                     }}
                     name="miscellaneous"
                  />
               </Grid>
            </Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.totalTruckPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={totalTruckPrice}
                     onChange={(e) => {}}
                     disabled
                     name="totalTruckPrice"
                  />
               </Grid>
            </Box>
            <Divider />
         </Box>

         {/* Cross Income Over Term
          */}
         <Box sx={{ paddingY: 4, display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.termsMonths')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={primaryTerm} disabled onChange={() => {}} />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.interestRate')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={customerLoanRatePercentage} disabled onChange={() => {}} />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.hours')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.hours}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'hours');
                     }}
                     name="hours"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.servicePerHour')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.servicePerHour}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'servicePerHour');
                     }}
                     name="servicePerHour"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.utilisation')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.utilisation}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'utilisation');
                     }}
                     name="utilisation"
                  />
               </Grid>
            </Box>
         </Box>
         <Box sx={{ paddingY: 4, display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.unitRecurringRevenue')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={70910} onChange={(e) => {}} disabled />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.estimatedResale')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={70910} onChange={(e) => {}} disabled />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.totalUnitInterestIncomeRevenue')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={70910} onChange={(e) => {}} disabled />
               </Grid>
            </Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.grossIncomeOverTerm')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField value={70910} onChange={(e) => {}} disabled />
               </Grid>
            </Box>
            <Divider />
         </Box>
      </Grid>
   );
};

const ShortTermRentalSection = () => {
   const [discountPercent, setDiscountPercent] = useState('' as any);
   const dataFilter = {} as any;
   const initDataFilter = {} as any;
   const { t } = useTranslation();
   const dispatch = useDispatch();
   return (
      <Grid
         item
         sx={{
            flex: 1,
            backgroundColor: '#fffff7',
            borderRadius: 1,
            boxShadow: 3,
            padding: 2,
            marginTop: 1,
         }}
      >
         <Typography
            sx={{
               fontSize: 16,
               fontWeight: 'bold',
            }}
         >
            {t('longTermRental.seccondLifeTitle')}
         </Typography>
         <Box sx={{ paddingY: 4, display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.monthlyRentalPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     suffix="%"
                     name="HYGLoanRate"
                     label={`${t('longTermRental.HYGLoanRate')}`}
                     placeholder={`${t('longTermRental.inputHYGLoanRate')}`}
                  />
               </Grid>
            </Box>
            <Divider sx={{ height: '316px' }} />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.acquisitionCostAndRefurb')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                     name="acquisitionCostAndRefurb"
                  />
               </Grid>
            </Box>
            <Divider />
         </Box>

         {/* Cross Income Over Term
          */}
         <Box sx={{ paddingY: 4, display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.termsMonths')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={70910}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.interestRate')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={70910}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.hours')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="hours"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.servicePerHour')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="servicePerHour"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.utilisation')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="utilisation"
                  />
               </Grid>
            </Box>
         </Box>
         <Box sx={{ paddingY: 4, display: 'flex', gap: 1, flexDirection: 'column' }}>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.unitRecurringRevenue')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={70910}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.estimatedResale')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={70910}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.totalUnitInterestIncomeRevenue')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={70910}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                  />
               </Grid>
            </Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.grossIncomeOverTerm')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={70910}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     disabled
                  />
               </Grid>
            </Box>
            <Divider />
         </Box>
      </Grid>
   );
};
const GeneralInput = () => {
   const [discountPercent, setDiscountPercent] = useState('' as any);
   const dataFilter = {} as any;
   const initDataFilter = {} as any;
   const { t } = useTranslation();
   const dispatch = useDispatch();
   //selector
   const selectedFilter = useSelector(longTermRentalStore.selectSelectedFilters);
   const optionsFilter = useSelector(longTermRentalStore.selectFilterOptions);
   const generalInputValues = useSelector(longTermRentalStore.selectGeneralInputValues);

   const fetchSelectOptions = async (selectedFilter) => {
      dispatch(longTermRentalStore.actions.setSelectedFilters(selectedFilter));
      longTermRentalApi.getSelectFilters(selectedFilter).then((rs) => {
         dispatch(
            longTermRentalStore.actions.setFilterOptions({
               ...optionsFilter,
               ...mappingFiltersToOptionValues(rs?.data),
            })
         );
      });
   };
   //event handling
   const handleChangeDataFilter = (option, field) => {
      const newSelectedFilter = { ...selectedFilter, [field]: option.value };
      console.log(newSelectedFilter, field, option);
      fetchSelectOptions(newSelectedFilter);
   };
   const handleCalculate = () => {};
   const handleClearInput = () => {};
   //init options for selectbox
   useEffect(() => {
      fetchSelectOptions(defaultValueSelectedFilterLongTermRental).then(() => {
         let cachedFilters = null;
         try {
            cachedFilters = JSON.parse(localStorage.getItem('longTermRentalFilters'));
         } catch (error) {}
         if (cachedFilters) {
            dispatch(longTermRentalStore.actions.setSelectedFilters(cachedFilters));
         }
      });
      dispatch(longTermRentalStore.sagaGetList());
   }, []);

   const handleChangeInputValue = ({ value }, field) => {
      dispatch(
         longTermRentalStore.actions.setGeneralInputsValues({
            ...generalInputValues,
            [field]: Number(value),
         })
      );
   };
   return (
      <>
         <Grid container spacing={1}>
            <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
               {/*<AppAutocomplete
                     value={_.map(dataFilter.region, (item) => {
                        return { value: item };
                     })}
                     options={optionsFilter.}
                     label={t('filters.region')}
                     onChange={(e, option) => handleChangeDataFilter(option, 'region')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />*/}
            </Grid>
            <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
               <AppAutocomplete
                  value={
                     selectedFilter?.series
                        ? {
                             value: selectedFilter.series,
                          }
                        : ''
                  }
                  options={optionsFilter.series}
                  label={t('filters.series')}
                  required
                  onChange={(e, option) => handleChangeDataFilter(option, 'series')}
                  limitTags={2}
                  disableListWrap
                  primaryKeyOption="value"
                  renderOption={(prop, option) => `${option.value}`}
                  getOptionLabel={(option) => `${option.value}`}
               />
            </Grid>
            <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
               <AppAutocomplete
                  value={
                     selectedFilter?.modelCode
                        ? {
                             value: selectedFilter.modelCode,
                          }
                        : ''
                  }
                  options={optionsFilter.modelCode}
                  required
                  label={t('filters.model')}
                  onChange={(e, option) => handleChangeDataFilter(option, 'model')}
                  limitTags={2}
                  disableListWrap
                  primaryKeyOption="value"
                  renderOption={(prop, option) => `${option.value}`}
                  getOptionLabel={(option) => `${option.value}`}
               />
            </Grid>
         </Grid>
         <Grid container spacing={1} marginTop={1}>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.cost || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'cost');
                  }}
                  name="cost"
                  required
                  label={`${t('longTermRental.cost')}`}
                  placeholder={`${t('longTermRental.inputCost')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.quantity || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'quantity');
                  }}
                  name="quantity"
                  required
                  label={`${t('longTermRental.quantity')}`}
                  placeholder={`${t('longTermRental.inputQuantity')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.financingFinanceTerm || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'financingFinanceTerm');
                  }}
                  name="financingFinanceTerm"
                  required
                  label={`${t('longTermRental.financingFinanceTerm')}`}
                  placeholder={`${t('longTermRental.inputFinancingFinanceTerm')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.primaryTerm || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'primaryTerm');
                  }}
                  required
                  name="primaryTerm"
                  label={`${t('longTermRental.primaryTerm')}`}
                  placeholder={`${t('longTermRental.inputMonths')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.seccondTerm || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'seccondTerm');
                  }}
                  required
                  name="seccondTerm"
                  label={`${t('longTermRental.seccondTerm')}`}
                  placeholder={`${t('longTermRental.inputMonths')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.dealerLoanRatePercentage || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'dealerLoanRatePercentage');
                  }}
                  name="dealerLoanRatePercentage"
                  label={`${t('longTermRental.dealerLoanRatePercentage')}`}
                  placeholder={`${t('longTermRental.inputDealerLoanRate')}`}
                  suffix="%"
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.customerLoanRatePercentage || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'customerLoanRatePercentage');
                  }}
                  name="customerLoanRatePercentage"
                  label={`${t('longTermRental.customerLoanRatePercentage')}`}
                  placeholder={`${t('longTermRental.inputCustomerLoanRate')}`}
                  suffix="%"
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.serviceRateCostPercentage || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'serviceRateCostPercentage');
                  }}
                  name="serviceRateCostPercentage"
                  label={`${t('longTermRental.serviceRateCostPercentage')}`}
                  placeholder={`${t('longTermRental.inputServiceRateCostPercentage')}`}
                  suffix="%"
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.HYGMargin || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'HYGMargin');
                  }}
                  name="HYGMargin"
                  suffix="%"
                  required
                  label={`${t('longTermRental.HYGMargin')}`}
                  placeholder={`${t('longTermRental.inputHYGMargin')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.streetPriceMargin || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'streetPriceMargin');
                  }}
                  name="streetPriceMargin"
                  required
                  label={`${t('longTermRental.streetPriceMargin')}`}
                  placeholder={`${t('longTermRental.inputStreetPriceMargin')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.SPVLoanRate || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'SPVLoanRate');
                  }}
                  name="SPVLoanRate"
                  label={`${t('longTermRental.SPVLoanRate')}`}
                  placeholder={`${t('longTermRental.inputSPVLoanRate')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  value={generalInputValues?.HYGLoanRate || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'HYGLoanRate');
                  }}
                  suffix="%"
                  name="HYGLoanRate"
                  label={`${t('longTermRental.HYGLoanRate')}`}
                  placeholder={`${t('longTermRental.inputHYGLoanRate')}`}
               />
            </Grid>
         </Grid>
         <Grid container spacing={1} marginTop={1}>
            <Grid item xs={1}>
               <Button
                  variant="contained"
                  onClick={handleCalculate}
                  sx={{ width: '100%', height: 24 }}
               >
                  {t('button.filter')}
               </Button>
            </Grid>
            <Grid item xs={1}>
               <Button
                  variant="contained"
                  onClick={handleClearInput}
                  sx={{ width: '100%', height: 24 }}
               >
                  {t('button.clear')}
               </Button>
            </Grid>
         </Grid>
      </>
   );
};
export default function LongtermRental() {
   const [discountPercent, setDiscountPercent] = useState('' as any);
   const dataFilter = {} as any;
   const initDataFilter = {} as any;
   const { t } = useTranslation();
   const dispatch = useDispatch();
   return (
      <>
         <AppLayout entity="longTermRental">
            <GeneralInput />
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }} gap={5}>
               <LongTermRentalSection />
               <ShortTermRentalSection />
            </Grid>
         </AppLayout>
      </>
   );
}
