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
import { useState } from 'react';
export default function LongtermRental() {
   const handleChangeDataFilter = (option, field) => {};
   const [discountPercent, setDiscountPercent] = useState('' as any);
   const dataFilter = {} as any;
   const initDataFilter = {} as any;
   const { t } = useTranslation();
   //
   const handleCalculate = () => {};
   const handleClearInput = () => {};
   return (
      <>
         <AppLayout entity="longTermRental">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.region, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.regions}
                     label={t('filters.region')}
                     onChange={(e, option) => handleChangeDataFilter(option, 'region')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.series, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.series}
                     label={t('filters.series')}
                     onChange={(e, option) => handleChangeDataFilter(option, 'series')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     value={_.map(dataFilter.model, (item) => {
                        return { value: item };
                     })}
                     options={initDataFilter.models}
                     label={t('filters.model')}
                     onChange={(e, option) => handleChangeDataFilter(option, 'model')}
                     limitTags={2}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
            </Grid>
            <Grid container spacing={1} marginTop={1}>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="cost"
                     required
                     label={`${t('longTermRental.cost')}`}
                     placeholder={`${t('longTermRental.inputCost')}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="quantity"
                     required
                     label={`${t('longTermRental.quantity')}`}
                     placeholder={`${t('longTermRental.inputQuantity')}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="financingFinanceTerm"
                     required
                     label={`${t('longTermRental.financingFinanceTerm')}`}
                     placeholder={`${t('longTermRental.inputFinancingFinanceTerm')}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     required
                     name="primaryTerm"
                     label={`${t('longTermRental.primaryTerm')}`}
                     placeholder={`${t('longTermRental.inputMonths')}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     required
                     name="seccondTerm"
                     label={`${t('longTermRental.seccondTerm')}`}
                     placeholder={`${t('longTermRental.inputMonths')}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="dealerLoanRatePercentage"
                     label={`${t('longTermRental.dealerLoanRatePercentage')}`}
                     placeholder={`${t('longTermRental.inputDealerLoanRate')}`}
                     suffix="%"
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="customerLoanRatePercentage"
                     label={`${t('longTermRental.customerLoanRatePercentage')}`}
                     placeholder={`${t('longTermRental.inputCustomerLoanRate')}`}
                     suffix="%"
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="serviceRateCostPercentage"
                     label={`${t('longTermRental.serviceRateCostPercentage')}`}
                     placeholder={`${t('longTermRental.inputServiceRateCostPercentage')}`}
                     suffix="%"
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
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
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="streetPriceMargin"
                     required
                     label={`${t('longTermRental.streetPriceMargin')}`}
                     placeholder={`${t('longTermRental.inputStreetPriceMargin')}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppNumberField
                     value={discountPercent}
                     onChange={(e) => {
                        setDiscountPercent(parseFloat(e.value));
                     }}
                     name="SPVLoanRate"
                     label={`${t('longTermRental.SPVLoanRate')}`}
                     placeholder={`${t('longTermRental.inputSPVLoanRate')}`}
                  />
               </Grid>
               <Grid item xs={2}>
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
            <Grid container sx={{ display: 'flex', flexDirection: 'row' }} gap={5}>
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
                        <Typography>{t('longTermRental.battery')}</Typography>
                        <Grid item xs={4} sx={{ backgroundColor: 'white' }}>
                           <AppNumberField
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
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
                              value={discountPercent}
                              onChange={(e) => {
                                 setDiscountPercent(parseFloat(e.value));
                              }}
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
                        <Typography>
                           {t('longTermRental.totalUnitInterestIncomeRevenue')}
                        </Typography>
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
                        <Typography>
                           {t('longTermRental.totalUnitInterestIncomeRevenue')}
                        </Typography>
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
            </Grid>
         </AppLayout>
      </>
   );
}
