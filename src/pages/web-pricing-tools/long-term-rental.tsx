import React from 'react';
//components
import { AppLayout, AppTextField, AppNumberField, AppAutocomplete } from '@/components';
import { Button, Typography } from '@mui/material';
import { Grid, Paper } from '@mui/material';
import { Box, Divider } from '@mui/material';
//libs
import _, { result } from 'lodash';
import { NumberSchema } from 'yup';
//hooks
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//store
import { longTermRentalStore } from '@/store/reducers';
//api
import longTermRentalApi from '@/api/longTermRental.api';
import residualValueApi from '@/api/residualValue.api';
//others
import { mappingFiltersToOptionValues } from '@/utils/mapping';
import { defaultValueSelectedFilterLongTermRental } from '@/utils/defaultValues';
import { relative } from 'path';
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
   const servicePerHour = useSelector(longTermRentalStore.selectServicePerHour);
   const residualPercentage = useSelector(longTermRentalStore.selectResidualPercentage);
   const {
      monthlyRentalPrice = 0,
      battery = 0,
      charger = 0,
      localFit = 0,
      telemetry = 0,
      freight = 0,
      importDutyAndCustomsClearance = 0,
      miscellaneous = 0,
      utilisation = 0,
   } = inputValues;
   //calculation values
   const truckPrice = (1 + streetPriceMargin) * cost || 0;
   const totalTruckPrice =
      truckPrice +
      battery +
      charger +
      localFit +
      telemetry +
      freight +
      importDutyAndCustomsClearance +
      miscellaneous;
   const unitRecurringRevenue = (primaryTerm * monthlyRentalPrice * utilisation) / 100;
   const estimatedResale = truckPrice * residualPercentage;
   const totalUnitInterestIncomeRevenue = null;
   const grossIncomeOverTerm = unitRecurringRevenue + estimatedResale;
   const sectionTitle = `${t('longTermRental.firstLifeTitle')}${primaryTerm ? `${primaryTerm} ${primaryTerm > 1 ? 'months' : 'month'}` : ''}`;

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
            {sectionTitle}
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
                     value={inputValues.monthlyRentalPrice}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'monthlyRentalPrice');
                     }}
                     prefix="$"
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
                  <AppNumberField value={truckPrice} onChange={(e) => {}} prefix="$" disabled />
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
                     prefix="$"
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
                     prefix="$"
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
                     prefix="$"
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
                     prefix="$"
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
                     prefix="$"
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
                     prefix="$"
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
                     prefix="$"
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
                     prefix="$"
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
                  <AppNumberField value={Number(primaryTerm)} disabled onChange={() => {}} />
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
                     value={customerLoanRatePercentage}
                     suffix="%"
                     disabled
                     onChange={() => {}}
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
                     value={servicePerHour}
                     prefix="$"
                     onChange={(e) => {
                        dispatch(longTermRentalStore.actions.setServicePerHours(Number(e.value)));
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
                     suffix="%"
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
                     prefix="$"
                     value={unitRecurringRevenue}
                     onChange={(e) => {}}
                     disabled
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
                  position: 'relative',
               }}
            >
               <Typography>{t('longTermRental.estimatedResale')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     prefix="$"
                     value={estimatedResale}
                     onChange={(e) => {}}
                     disabled
                  />
               </Grid>
               <Typography sx={{ position: 'absolute', right: 50 }}>
                  {`${(residualPercentage * 100).toFixed(1)}%`}
               </Typography>
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
                     value={totalUnitInterestIncomeRevenue}
                     onChange={(e) => {}}
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
                     prefix="$"
                     value={grossIncomeOverTerm}
                     onChange={(e) => {}}
                     disabled
                  />
               </Grid>
            </Box>
            <Divider />
         </Box>
      </Grid>
   );
};

const ShortTermRentalSection = () => {
   const [inputValues, setInputValues] = useState({} as any);
   //event handling
   const handleChangeInputValue = ({ value }, field) => {
      setInputValues({ ...inputValues, [field]: Number(value) });
   };
   const servicePerHour = useSelector(longTermRentalStore.selectServicePerHour);
   const { monthlyRentalPrice = 0, utilisation = 0 } = inputValues;
   //selector
   const { seccondTerm, serviceRateCostPercentage } = useSelector(
      longTermRentalStore.selectGeneralInputValues
   );
   const { t } = useTranslation();
   const dispatch = useDispatch();
   //calculate data
   const servicePerHourShortTerm = (servicePerHour * serviceRateCostPercentage) / 100;
   const unitRecurringRevenue = (monthlyRentalPrice * seccondTerm * utilisation) / 100;
   const estimatedResale = 0;
   const totalIncomeOverTerm = unitRecurringRevenue + estimatedResale;
   const sectionTitle = `${t('longTermRental.seccondLifeTitle')}${seccondTerm ? `+ ${seccondTerm} ${seccondTerm > 1 ? 'months' : 'month'}` : ''}`;

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
            {sectionTitle}
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
                     value={inputValues.monthlyRentalPrice}
                     prefix="$"
                     onChange={(e) => {
                        handleChangeInputValue(e, 'monthlyRentalPrice');
                     }}
                     name="monthlyRentalPrice"
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
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     value={inputValues.acquisitionCostAndRefurb}
                     prefix="$"
                     onChange={(e) => {
                        handleChangeInputValue(e, 'acquisitionCostAndRefurb');
                     }}
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
                  <AppNumberField value={seccondTerm} onChange={(e) => {}} disabled />
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
                     value={inputValues.interestRate}
                     onChange={(e) => {
                        handleChangeInputValue(e, 'interestRate');
                     }}
                     suffix="%"
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
               <Grid item xs={4} sx={{ backgroundColor: '#f2f2f2' }}>
                  <AppNumberField
                     value={servicePerHourShortTerm}
                     prefix="$"
                     onChange={() => {}}
                     disabled
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
                     suffix="%"
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
                     prefix="$"
                     value={unitRecurringRevenue}
                     onChange={(e) => {}}
                     disabled
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
                  position: 'relative',
               }}
            >
               <Typography>{t('longTermRental.estimatedResale')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     prefix="$"
                     value={estimatedResale}
                     onChange={(e) => {}}
                     disabled
                  />
               </Grid>
               <Typography
                  sx={{ position: 'absolute', right: 50 }}
               >{`${Number(0).toFixed(1)}%`}</Typography>
            </Box>
            <Box sx={{ height: '25px' }}></Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 20,
               }}
            >
               <Typography>{t('longTermRental.totalIncomeOverTerm')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     prefix="$"
                     value={totalIncomeOverTerm}
                     onChange={(e) => {}}
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
   const { t } = useTranslation();
   const dispatch = useDispatch();
   //selector
   const selectedFilter = useSelector(longTermRentalStore.selectSelectedFilters);
   const optionsFilter = useSelector(longTermRentalStore.selectFilterOptions);
   const generalInputValues = useSelector(longTermRentalStore.selectGeneralInputValues);
   const {
      cost,
      quantity,
      financingFinanceTerm,
      primaryTerm,
      seccondTerm,
      streetPriceMargin,
      HYGMargin,
   } = generalInputValues;
   const { modelCode } = selectedFilter;

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
      fetchSelectOptions(newSelectedFilter);
   };
   const handleCalculate = () => {};
   const handleClearInput = () => {
      dispatch(longTermRentalStore.actions.setGeneralInputsValues({}));
      dispatch(longTermRentalStore.actions.setSelectedFilters({}));
   };
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
      const newGeneralInputValues = {
         ...generalInputValues,
         [field]: value ? Number(value) : null,
      };
      dispatch(longTermRentalStore.actions.setGeneralInputsValues(newGeneralInputValues));
   };
   const checkValidCalculation = () => {
      return ![
         cost,
         quantity,
         financingFinanceTerm,
         primaryTerm,
         seccondTerm,
         streetPriceMargin,
         HYGMargin,
         modelCode,
      ].some((value) => value === null);
   };
   const isAbleToCalculate = checkValidCalculation();
   useEffect(() => {
      dispatch(longTermRentalStore.actions.setIsAbleToCalculate(isAbleToCalculate));
   }, [generalInputValues, selectedFilter]);
   useEffect(() => {
      if (modelCode && primaryTerm) {
         longTermRentalApi
            .getResidualPercentage({ modelCode, longTermMonths: primaryTerm })
            .then((result) => {
               dispatch(
                  longTermRentalStore.actions.setresidualPercentage(
                     result?.data?.residualPercentage
                  )
               );
            });
      }
   }, [modelCode, primaryTerm]);
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
                  defaultValue={null}
                  value={
                     selectedFilter?.series
                        ? {
                             value: selectedFilter.series,
                          }
                        : 'All'
                  }
                  options={[{ value: null }, ...(optionsFilter.series || [])]}
                  label={t('filters.series')}
                  onChange={(e, option) => handleChangeDataFilter(option, 'series')}
                  limitTags={2}
                  disableListWrap
                  primaryKeyOption="value"
                  renderOption={(prop, option) => `${option.value || 'All'}`}
                  getOptionLabel={(option) => `${option.value || 'All'}`}
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
                  onChange={(e, option) => handleChangeDataFilter(option, 'modelCode')}
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
                  prefix="$"
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
                  isDecimalScale
                  decimalScale={0}
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
                  isDecimalScale
                  decimalScale={0}
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
