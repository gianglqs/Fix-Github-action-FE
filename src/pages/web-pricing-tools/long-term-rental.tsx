import React, { useLayoutEffect } from 'react';
//components
import { AppLayout, AppTextField, AppNumberField, AppAutocomplete } from '@/components';
import { Button, Typography } from '@mui/material';
import { Grid, Paper } from '@mui/material';
import { Box, Divider } from '@mui/material';
//hooks
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
//store
import { longTermRentalStore } from '@/store/reducers';
import { commonStore } from '@/store/reducers';
//api
import longTermRentalApi from '@/api/longTermRental.api';
//others
import { mappingFiltersToOptionValues } from '@/utils/mapping';
import { defaultValueSelectedFilterLongTermRental } from '@/utils/defaultValues';
import { makeStyles } from '@mui/styles';
import { relative } from 'path';

const useStyles = makeStyles((theme) => ({
   customDisabledInput: {
      '& .Mui-disabled ': {
         textFillColor: 'rgba(0, 0, 0, 0.7)',
         fontWeight: '500',
      },
   },
}));

const LongTermRentalSection = () => {
   const { t } = useTranslation();
   const dispatch = useDispatch();
   const classes = useStyles();

   //selector
   const {
      cost = 0,
      streetPriceMargin = 0,
      primaryTerm = 0,
      customerLoanRatePercentage = 0,
   } = useSelector(longTermRentalStore.selectGeneralInputValues);
   const isAbleToCalculate = useSelector(longTermRentalStore.selectIsAbleToCalculate);
   const servicePerHour = useSelector(longTermRentalStore.selectServicePerHour);
   const residualPercentage = useSelector(longTermRentalStore.selectResidualPercentage);
   const inputValues = useSelector(longTermRentalStore.selectLongTermInputValues);
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
   //event handling
   const handleChangeInputValue = (e, field) => {
      const newInputValues = {
         ...inputValues,
         [field]: Number(e.value),
      };
      localStorage.setItem('longTermInputRental', JSON.stringify(newInputValues));
      dispatch(longTermRentalStore.actions.setLongTermInputsValues(newInputValues));
   };

   useEffect(() => {
      const servicePerHour = localStorage.getItem('servicePerHour');
      if (servicePerHour) {
         dispatch(longTermRentalStore.actions.setServicePerHours(Number(servicePerHour)));
      }
   }, []);
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
            boxShadow: 2,
            border: '1px solid rgba(150,150,150,0.4)',
            padding: 2,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 1,
            minWidth: '600px',
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.monthlyRentalPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     defaultValue={0}
                     value={inputValues.monthlyRentalPrice || 0}
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
                  paddingX: 10,
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.truckPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={isAbleToCalculate ? truckPrice || 0 : ' '}
                     onChange={(e) => {}}
                     prefix="$"
                     decimalScale={2}
                     isDecimalScale
                     disabled
                     className={classes.customDisabledInput}
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.battery')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={inputValues.battery || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.charger')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={inputValues.charger || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.localFit')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={inputValues.localFit || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.telemetry')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={inputValues.telemetry || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.freight')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={inputValues.freight || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.importDutyAndCustomsClearance')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.importDutyAndCustomsClearance || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.miscellaneous')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.miscellaneous || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.totalTruckPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={isAbleToCalculate ? totalTruckPrice || 0 : ' '}
                     debounceDelay={1}
                     onChange={(e) => {}}
                     className={classes.customDisabledInput}
                     disabled
                     decimalScale={2}
                     isDecimalScale
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.termsMonths')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={isAbleToCalculate ? Number(primaryTerm) || 0 : ' '}
                     className={classes.customDisabledInput}
                     disabled
                     onChange={() => {}}
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.interestRate')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={isAbleToCalculate ? customerLoanRatePercentage || 0 : ' '}
                     suffix="%"
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                     onChange={() => {}}
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.hours')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.hours || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.servicePerHour')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={servicePerHour || 0}
                     prefix="$"
                     onChange={(e) => {
                        localStorage.setItem('servicePerHour', e.value);
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.utilisation')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.utilisation || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.unitRecurringRevenue')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={isAbleToCalculate ? unitRecurringRevenue || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
                  position: 'relative',
               }}
            >
               <Typography>{t('longTermRental.estimatedResale')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={isAbleToCalculate ? estimatedResale || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                  />
               </Grid>
               <Typography sx={{ position: 'absolute', right: 30 }}>
                  {isAbleToCalculate && `${(residualPercentage * 100).toFixed(2)}%`}
               </Typography>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.totalUnitInterestIncomeRevenue')}</Typography>
               {/*<Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     value={isAbleToCalculate ? totalUnitInterestIncomeRevenue || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     decimalScale={2}
                     isDecimalScale
                  />
               </Grid>*/}
            </Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.grossIncomeOverTerm')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={isAbleToCalculate ? grossIncomeOverTerm || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                  />
               </Grid>
            </Box>
            <Divider />
         </Box>
      </Grid>
   );
};

const ShortTermRentalSection = () => {
   const { t } = useTranslation();
   const dispatch = useDispatch();
   const classes = useStyles();
   //selector
   const { seccondTerm = 0, serviceRateCostPercentage = 0 } = useSelector(
      longTermRentalStore.selectGeneralInputValues
   );
   const isAbleToCalculate = useSelector(longTermRentalStore.selectIsAbleToCalculate);
   const servicePerHour = useSelector(longTermRentalStore.selectServicePerHour) || 0;
   const inputValues = useSelector(longTermRentalStore.selectShortTermInputValues);

   const { monthlyRentalPrice = 0, utilisation = 0 } = inputValues;
   //event handling
   const handleChangeInputValue = ({ value }, field) => {
      const newInputValues = {
         ...inputValues,
         [field]: Number(value),
      };
      localStorage.setItem('shortTermInputRental', JSON.stringify(newInputValues));
      dispatch(longTermRentalStore.actions.setShortTermInputsValues(newInputValues));
   };

   //calculate data
   const servicePerHourShortTerm = (servicePerHour * serviceRateCostPercentage) / 100;
   const unitRecurringRevenue = (monthlyRentalPrice * seccondTerm * utilisation) / 100;
   const estimatedResale = 0;
   const totalIncomeOverTerm = unitRecurringRevenue + estimatedResale;
   const sectionTitle = `${t('longTermRental.secondLifeTitle')}${seccondTerm ? `+ ${seccondTerm} ${seccondTerm > 1 ? 'months' : 'month'}` : ''}`;

   return (
      <Grid
         item
         sx={{
            flex: 1,
            border: '1px solid rgba(150,150,150,0.4)',
            backgroundColor: '#fffff7',
            borderRadius: 5,
            boxShadow: 2,
            padding: 2,
            marginTop: 1,
            minWidth: '600px',
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.monthlyRentalPrice')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.monthlyRentalPrice || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.acquisitionCostAndRefurb')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.acquisitionCostAndRefurb || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.termsMonths')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     sx={{ color: 'black' }}
                     value={isAbleToCalculate ? seccondTerm || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.interestRate')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.interestRate || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.hours')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.hours || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.servicePerHour')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: '#f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={isAbleToCalculate ? servicePerHourShortTerm || 0 : ' '}
                     prefix="$"
                     onChange={() => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                     name="servicePerHour"
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.utilisation')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                  <AppNumberField
                     debounceDelay={1}
                     value={inputValues.utilisation || 0}
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
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.unitRecurringRevenue')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={isAbleToCalculate ? unitRecurringRevenue || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                  />
               </Grid>
            </Box>
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
                  position: 'relative',
               }}
            >
               <Typography>{t('longTermRental.estimatedResale')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={isAbleToCalculate ? estimatedResale || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
                  />
               </Grid>
               <Typography sx={{ position: 'absolute', right: 30 }}>
                  {isAbleToCalculate && `${Number(0)}%`}
               </Typography>
            </Box>
            <Box sx={{ height: '20px' }}></Box>
            <Divider />
            <Box
               sx={{
                  justifyContent: 'space-between',
                  display: 'flex',
                  paddingX: 10,
               }}
            >
               <Typography>{t('longTermRental.totalIncomeOverTerm')}</Typography>
               <Grid item xs={4} sx={{ backgroundColor: ' #f2f2f2' }}>
                  <AppNumberField
                     debounceDelay={1}
                     prefix="$"
                     value={isAbleToCalculate ? totalIncomeOverTerm || 0 : ' '}
                     onChange={(e) => {}}
                     disabled
                     className={classes.customDisabledInput}
                     decimalScale={2}
                     isDecimalScale
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
   const isAbleToCalculate = useSelector(longTermRentalStore.selectIsAbleToCalculate);
   const {
      cost,
      quantity,
      financingFinanceTerm,
      primaryTerm,
      seccondTerm,
      dealerLoanRatePercentage,
      customerLoanRatePercentage,
      serviceRateCostPercentage,
      streetPriceMargin,
      HYGMargin,
   } = generalInputValues;
   const { modelCode } = selectedFilter;

   const fetchSelectOptions = async (selectedFilter) => {
      dispatch(longTermRentalStore.actions.setSelectedFilters(selectedFilter));
      const requestPayload = {
         modelCode: selectedFilter?.modelCode,
         series: [selectedFilter?.series],
      };
      longTermRentalApi.getSelectFilters(requestPayload).then((rs) => {
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
      const newSelectedFilter = {
         ...selectedFilter,
         [field]: option.value === 'All' ? null : option.value,
      };
      if (field === 'series') {
         newSelectedFilter.modelCode = null;
      }
      localStorage.setItem('generalFilterLongTermRental', JSON.stringify(newSelectedFilter));

      fetchSelectOptions(newSelectedFilter);
   };
   const handleCalculate = () => {
      if (!isAbleToCalculate) {
         dispatch(
            commonStore.actions.setErrorMessage(t('commonErrorMessage.requiredFieldsMustBeFilled'))
         );
      }
   };
   const handleRemoveCached = () => {
      localStorage.removeItem('generalFilterLongTermRental');
      localStorage.removeItem('generalInputLongTermRental');
      localStorage.removeItem('longTermInputRental');
      localStorage.removeItem('shortTermInputRental');
      localStorage.removeItem('servicePerHour');
   };
   const handleClearInput = () => {
      dispatch(longTermRentalStore.actions.resetInputValues());
      handleRemoveCached();
      fetchSelectOptions({ series: null, modelCode: null });
   };
   //init options for selectbox
   useEffect(() => {
      let cachedFilters = null;
      try {
         cachedFilters = JSON.parse(localStorage.getItem('generalFilterLongTermRental'));
      } catch (error) {}
      if (cachedFilters) {
         dispatch(longTermRentalStore.actions.setSelectedFilters(cachedFilters));
         fetchSelectOptions(cachedFilters);
      } else {
         fetchSelectOptions(defaultValueSelectedFilterLongTermRental);
      }
      dispatch(longTermRentalStore.sagaGetList());
   }, []);

   const handleChangeInputValue = ({ value }, field) => {
      const newGeneralInputValues = {
         ...generalInputValues,
         [field]: value ? Number(value) : null,
      };
      dispatch(longTermRentalStore.actions.setGeneralInputsValues(newGeneralInputValues));
      localStorage.setItem('generalInputLongTermRental', JSON.stringify(newGeneralInputValues));
   };
   useEffect(() => {
      const isAbleToCalculate = [
         cost,
         quantity,
         financingFinanceTerm,
         primaryTerm,
         seccondTerm,
         dealerLoanRatePercentage,
         customerLoanRatePercentage,
         serviceRateCostPercentage,
         modelCode,
      ].every((value) => value !== null && value !== undefined);
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

   useEffect(() => {
      const generalFilterLongTermRental = localStorage.getItem('generalFilterLongTermRental');
      if (generalFilterLongTermRental) {
         console.log(generalFilterLongTermRental);
         dispatch(
            longTermRentalStore.actions.setSelectedFilters(JSON.parse(generalFilterLongTermRental))
         );
      }
   }, []);

   return (
      <>
         <Grid container spacing={1}>
            <div></div>
            <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
               <AppAutocomplete
                  defaultValue={'All'}
                  value={
                     selectedFilter?.series !== null
                        ? {
                             value: selectedFilter.series,
                          }
                        : 'All'
                  }
                  options={[{ value: 'All' }, ...(optionsFilter.series || [])]}
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
                     selectedFilter?.modelCode !== null
                        ? {
                             value: selectedFilter.modelCode,
                          }
                        : null
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
                  debounceDelay={1}
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
                  debounceDelay={1}
                  value={generalInputValues?.quantity || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'quantity');
                  }}
                  name="quantity"
                  isDecimalScale
                  decimalScale={0}
                  required
                  label={`${t('longTermRental.quantity')}`}
                  placeholder={`${t('longTermRental.inputQuantity')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
                  value={generalInputValues?.financingFinanceTerm || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'financingFinanceTerm');
                  }}
                  isDecimalScale
                  decimalScale={0}
                  name="financingFinanceTerm"
                  required
                  label={`${t('longTermRental.financingFinanceTerm')}`}
                  placeholder={`${t('longTermRental.inputFinancingFinanceTerm')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
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
                  debounceDelay={1}
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
                  debounceDelay={1}
                  value={generalInputValues?.dealerLoanRatePercentage || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'dealerLoanRatePercentage');
                  }}
                  suffix="%"
                  isAllowed={(values) => {
                     const { formattedValue, floatValue } = values;
                     return formattedValue === '' || floatValue <= 100;
                  }}
                  required
                  name="dealerLoanRatePercentage"
                  label={`${t('longTermRental.dealerLoanRatePercentage')}`}
                  placeholder={`${t('longTermRental.inputDealerLoanRate')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
                  value={generalInputValues?.customerLoanRatePercentage || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'customerLoanRatePercentage');
                  }}
                  isAllowed={(values) => {
                     const { formattedValue, floatValue } = values;
                     return formattedValue === '' || floatValue <= 100;
                  }}
                  required
                  name="customerLoanRatePercentage"
                  label={`${t('longTermRental.customerLoanRatePercentage')}`}
                  placeholder={`${t('longTermRental.inputCustomerLoanRate')}`}
                  suffix="%"
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
                  value={generalInputValues?.serviceRateCostPercentage || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'serviceRateCostPercentage');
                  }}
                  required
                  name="serviceRateCostPercentage"
                  label={`${t('longTermRental.serviceRateCostPercentage')}`}
                  placeholder={`${t('longTermRental.inputServiceRateCostPercentage')}`}
                  suffix="%"
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
                  value={generalInputValues?.HYGMargin || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'HYGMargin');
                  }}
                  name="HYGMargin"
                  label={`${t('longTermRental.HYGMargin')}`}
                  placeholder={`${t('longTermRental.inputHYGMargin')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
                  value={generalInputValues?.streetPriceMargin || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'streetPriceMargin');
                  }}
                  name="streetPriceMargin"
                  label={`${t('longTermRental.streetPriceMargin')}`}
                  placeholder={`${t('longTermRental.inputStreetPriceMargin')}`}
               />
            </Grid>
            <Grid item xs={2}>
               <AppNumberField
                  debounceDelay={1}
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
                  debounceDelay={1}
                  value={generalInputValues?.HYGLoanRate || ''}
                  onChange={(e) => {
                     handleChangeInputValue(e, 'HYGLoanRate');
                  }}
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
                  {t('button.calculate')}
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
   const { t } = useTranslation();
   const dispatch = useDispatch();
   useLayoutEffect(() => {
      const generalInputLongTermRental = localStorage.getItem('generalInputLongTermRental');
      if (generalInputLongTermRental) {
         dispatch(
            longTermRentalStore.actions.setGeneralInputsValues(
               JSON.parse(generalInputLongTermRental)
            )
         );
      }
      const longTermInputRental = localStorage.getItem('longTermInputRental');
      if (longTermInputRental) {
         dispatch(
            longTermRentalStore.actions.setLongTermInputsValues(JSON.parse(longTermInputRental))
         );
      }
      const shortTermInputRental = localStorage.getItem('shortTermInputRental');
      if (shortTermInputRental) {
         dispatch(
            longTermRentalStore.actions.setShortTermInputsValues(JSON.parse(shortTermInputRental))
         );
      }
   }, []);
   return (
      <>
         <AppLayout entity="longTermRental">
            <GeneralInput />
            <Grid container sx={{ display: 'flex', flexDirection: 'row', marginY: 2 }} gap={5}>
               <LongTermRentalSection />
               <ShortTermRentalSection />
            </Grid>
         </AppLayout>
      </>
   );
}
