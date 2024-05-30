import { Button, Dialog, Grid, Paper, Typography } from '@mui/material';
import _ from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import MarginHistoryDialog from './MarginHistoryDialog';
import marginAnalysisApi from '@/api/marginAnalysis.api';

export default function CompareMarginDialog(props) {
   const { open, onClose } = props;

   const [data1, setData1] = useState({
      monthly: null,
      annually: null,
   });

   const [data2, setData2] = useState({
      monthly: null,
      annually: null,
   });

   const [openHistory, setOpenHistory] = useState({
      open: false,
      data: [],
   });

   const [chooseState, setChooseState] = useState(1);

   const loadHistoryMargin = async () => {
      const { data } = await marginAnalysisApi.listHistoryMargin({});

      setOpenHistory({
         open: true,
         data: data?.historicalMargin,
      });
   };

   const handleChoose = async (value) => {
      loadHistoryMargin();
      setChooseState(value);
   };
   const handleClose = () => {
      setOpenHistory({
         open: false,
         data: [],
      });
   };

   const handleOnRowClick = async (value) => {
      const transformedDataAnnually = {
         quoteNumber: value.quoteNumber,
         type: value.type,
         modelCode: value.modelCode,
         series: value.series,
         currency: value.currency,
         region: value.region,
         durationUnit: 'annually',
      };

      const transformedDataMonthly = {
         quoteNumber: value.quoteNumber,
         type: value.type,
         modelCode: value.modelCode,
         series: value.series,
         currency: value.currency,
         region: value.region,
         durationUnit: 'monthly',
      };
      const annually = (await marginAnalysisApi.viewHistoryMargin(transformedDataAnnually)).data;
      const monthly = (await marginAnalysisApi.viewHistoryMargin(transformedDataMonthly)).data;

      if (chooseState == 1)
         setData1({
            annually: annually.margin,
            monthly: monthly.margin,
         });
      else
         setData2({
            annually: annually.margin,
            monthly: monthly.margin,
         });
   };

   const handleClear = (value) => {
      if (value == 1)
         setData1({
            annually: null,
            monthly: null,
         });
      else
         setData2({
            annually: null,
            monthly: null,
         });
   };

   return (
      <>
         <Dialog open={open} onClose={onClose} maxWidth="lg">
            <Grid container spacing={2} sx={{ padding: 5 }}>
               <Grid item xs={6}>
                  <Button
                     variant="contained"
                     sx={{ width: '25%', height: 24 }}
                     onClick={() => handleChoose(1)}
                  >
                     Choose
                  </Button>
                  <Button
                     variant="contained"
                     sx={{ width: '25%', height: 24, marginLeft: 1 }}
                     onClick={() => handleClear(1)}
                  >
                     Clear
                  </Button>
               </Grid>
               <Grid item xs={6}>
                  <Button
                     variant="contained"
                     sx={{ width: '25%', height: 24 }}
                     onClick={() => handleChoose(2)}
                  >
                     Choose
                  </Button>
                  <Button
                     variant="contained"
                     sx={{ width: '25%', height: 24, marginLeft: 1 }}
                     onClick={() => handleClear(2)}
                  >
                     Clear
                  </Button>
               </Grid>

               <MarginInformationBox data={data1} />
               <MarginInformationBox data={data2} />

               <MarginPercentageAOPRateBox
                  data={data1}
                  valueCurrency={data1?.annually?.id?.currency}
               />
               <MarginPercentageAOPRateBox
                  data={data2}
                  valueCurrency={data2?.annually?.id?.currency}
               />

               <FullCostAOPRateBox data={data1} valueCurrency={data1?.annually?.id?.currency} />
               <FullCostAOPRateBox data={data2} valueCurrency={data2?.annually?.id?.currency} />

               <ForUSPricingBox data={data1} valueCurrency={data1?.annually?.id?.currency} />
               <ForUSPricingBox data={data2} valueCurrency={data2?.annually?.id?.currency} />
            </Grid>
         </Dialog>
         <MarginHistoryDialog
            open={openHistory.open}
            onClose={handleClose}
            data={openHistory.data}
            handleOnRowClick={handleOnRowClick}
            loadHistoryMargin={loadHistoryMargin}
         />
      </>
   );
}

const MarginInformationBox = (props) => {
   const { data } = props;

   const { t } = useTranslation();

   return (
      <Grid item xs={6}>
         <Paper elevation={3} sx={{ padding: 2, height: 'fit-content' }}>
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  Quote Number
               </Typography>
               <Typography variant="body1" component="span">
                  {data.annually?.id.quoteNumber}
               </Typography>
            </div>

            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  #
               </Typography>
               <Typography variant="body1" component="span">
                  {data.annually?.id.type}
               </Typography>
            </div>

            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  Model Code
               </Typography>
               <Typography variant="body1" component="span">
                  {data.annually?.id.modelCode}
               </Typography>
            </div>

            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  Series
               </Typography>
               <Typography variant="body1" component="span">
                  {data.annually?.id.series}
               </Typography>
            </div>

            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  Currency
               </Typography>
               <Typography variant="body1" component="span">
                  {data.annually?.id.currency}
               </Typography>
            </div>

            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  Region
               </Typography>
               <Typography variant="body1" component="span">
                  {data.annually?.id.region}
               </Typography>
            </div>
         </Paper>
      </Grid>
   );
};

const MarginPercentageAOPRateBox = (props) => {
   const { t } = useTranslation();
   const { data, valueCurrency } = props;
   return (
      <Grid item xs={6}>
         <Paper elevation={3} sx={{ padding: 2, height: 'fit-content' }}>
            <Grid
               item
               xs={6}
               className="space-between-element"
               sx={{ display: 'flex', marginLeft: '260px', marginBottom: '7px' }}
            >
               <Typography sx={{ fontWeight: 'bold' }} variant="body1">
                  {t('quotationMargin.AOPrate')}
               </Typography>
               <Typography sx={{ fontWeight: 'bold' }} variant="body1">
                  {t('quotationMargin.monthlyRate')}
               </Typography>
            </Grid>

            <div className="space-between-element">
               <Typography
                  sx={{ fontWeight: 'bold', marginLeft: 1 }}
                  variant="body1"
                  component="span"
               >
                  {`${t('quotationMargin.totalListPrice')} `}
                  {valueCurrency ? `(${valueCurrency})` : ''}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography
                     sx={{ fontWeight: 'bold', marginRight: 1 }}
                     variant="body1"
                     component="span"
                  >
                     {data.annually?.totalListPrice.toLocaleString()}
                  </Typography>

                  <Typography
                     sx={{ fontWeight: 'bold', marginRight: 1 }}
                     variant="body1"
                     component="span"
                  >
                     {data.monthly?.totalListPrice.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {t('quotationMargin.blendedDiscountPercentage')}
               </Typography>
               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                     {_.isNil(data.annually?.blendedDiscountPercentage)
                        ? ''
                        : `${(data.annually?.blendedDiscountPercentage * 100).toFixed(2)}%`}
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                     {_.isNil(data.monthly?.blendedDiscountPercentage)
                        ? ''
                        : `${(data.monthly?.blendedDiscountPercentage * 100).toFixed(2)}%`}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {`${t('quotationMargin.dealerNet')} `}
                  {valueCurrency ? `(${valueCurrency})` : ''}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                     {data.annually?.dealerNet.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                     {data.monthly?.dealerNet.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span" sx={{ marginLeft: 1 }}>
                  {t('quotationMargin.margin')}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                     {data.annually?.margin.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span" sx={{ marginRight: 1 }}>
                     {data.monthly?.margin.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div
               className="space-between-element"
               style={{
                  backgroundColor: '#e7a800',
                  border: '1px solid #e7a800',
                  borderRadius: 10,
               }}
            >
               <Typography
                  variant="body1"
                  component="span"
                  sx={{ fontWeight: 'bold', marginLeft: 1 }}
               >
                  {t('quotationMargin.marginPercentageAOPRateInDialog')}{' '}
               </Typography>
               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography
                     variant="body1"
                     component="span"
                     sx={{ fontWeight: 'bold', marginRight: 1 }}
                  >
                     {_.isNil(data.annually?.marginPercentageAOPRate)
                        ? ''
                        : `${(data.annually?.marginPercentageAOPRate * 100).toFixed(2)}%`}
                  </Typography>
                  <Typography
                     variant="body1"
                     component="span"
                     sx={{ fontWeight: 'bold', marginRight: 1 }}
                  >
                     {_.isNil(data.monthly?.marginPercentageAOPRate)
                        ? ''
                        : `${(data.monthly?.marginPercentageAOPRate * 100).toFixed(2)}%`}
                  </Typography>
               </div>
            </div>
         </Paper>
      </Grid>
   );
};

const FullCostAOPRateBox = (props) => {
   const { t } = useTranslation();
   const { data, valueCurrency } = props;

   return (
      <Grid item xs={6}>
         <Paper
            elevation={2}
            sx={{
               padding: 2,
               height: 'fit-content',
            }}
         >
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {t('quotationMargin.marginAnalysisAOPRate')}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                     {data.annually?.marginAOPRate.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                     {data.monthly?.marginAOPRate.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {data.annually?.plant == 'HYM' ||
                  data.annually?.plant == 'Ruyi' ||
                  data.annually?.plant == 'Staxx' ||
                  data.annually?.plant == 'Maximal'
                     ? `${t('quotationMargin.manufacturingCost')} (RMB)`
                     : data.annually?.plant == 'SN'
                       ? `${t('quotationMargin.manufacturingCost')} (USD)`
                       : `${t('quotationMargin.manufacturingCost')} `}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.totalManufacturingCost.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.totalManufacturingCost.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.costUplift')}{' '}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.annually?.costUplift)
                        ? ''
                        : `${(data.annually?.costUplift * 100).toFixed(2)}%`}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.monthly?.costUplift)
                        ? ''
                        : `${(data.monthly?.costUplift * 100).toFixed(2)}%`}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.addWarranty')}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.annually?.addWarranty)
                        ? ''
                        : `${(data.annually?.addWarranty * 100).toFixed(2)}%`}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.monthly?.addWarranty)
                        ? ''
                        : `${(data.monthly?.addWarranty * 100).toFixed(2)}%`}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.surcharge')}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.annually?.surcharge)
                        ? ''
                        : `${(data.annually?.surcharge * 100).toFixed(2)}%`}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.monthly?.surcharge)
                        ? ''
                        : `${(data.monthly?.surcharge * 100).toFixed(2)}%`}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.duty')} (AU BT Only)
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.annually?.duty)
                        ? ''
                        : `${(data.annually?.duty * 100).toFixed(2)}%`}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.monthly?.duty)
                        ? ''
                        : `${(data.monthly?.duty * 100).toFixed(2)}%`}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.freight')} (AU Only)
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.freight}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.freight}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.liIonIncluded')}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.annually?.liIonIncluded)
                        ? ''
                        : data.annually?.liIonIncluded
                          ? 'Yes'
                          : 'No'}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {_.isNil(data.monthly?.liIonIncluded)
                        ? ''
                        : data.monthly?.liIonIncluded
                          ? 'Yes'
                          : 'No'}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {data.annually?.fileUUID != null
                     ? data.annually?.plant == 'HYM' ||
                       data.annually?.plant == 'Ruyi' ||
                       data.annually?.plant == 'Staxx' ||
                       data.annually?.plant == 'Maximal'
                        ? `${t('quotationMargin.totalCost')} (RMB)`
                        : `${t('quotationMargin.totalCost')} (USD)`
                     : `${t('quotationMargin.totalCost')}`}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.totalCost.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.totalCost.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {`${t('quotationMargin.fullCost')} ${valueCurrency || ''}`}
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                     {data.annually?.fullCostAOPRate.toLocaleString()}
                  </Typography>
                  <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                     {data.monthly?.fullCostAOPRate.toLocaleString()}
                  </Typography>
               </div>
            </div>
         </Paper>
      </Grid>
   );
};

const ForUSPricingBox = (props) => {
   const { t } = useTranslation();
   const { data, valueCurrency } = props;

   return (
      <Grid item xs={6}>
         <Paper elevation={3} sx={{ padding: 2, height: 'fit-content' }}>
            <div className="space-between-element">
               <Typography sx={{ fontWeight: 'bold' }} variant="body1" component="span">
                  {t('quotationMargin.forUSPricing')}
               </Typography>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.manufacturingCost')} ({valueCurrency})
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.manufacturingCostUSD.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.manufacturingCostUSD.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.addWarranty')} ({valueCurrency})
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.warrantyCost.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.warrantyCost.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.surcharge')} ({valueCurrency})
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.surchargeCost.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.surchargeCost.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.totalCost')} {t('quotationMargin.excludingFreight')} (
                  {valueCurrency})
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.totalCostWithoutFreight.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.totalCostWithoutFreight.toLocaleString()}
                  </Typography>
               </div>
            </div>
            <div className="space-between-element">
               <Typography variant="body1" component="span">
                  {t('quotationMargin.totalCost')} {t('quotationMargin.withFreight')} (
                  {valueCurrency})
               </Typography>

               <div className="space-between-element" style={{ width: '50%' }}>
                  <Typography variant="body1" component="span">
                     {data.annually?.totalCostWithFreight.toLocaleString()}
                  </Typography>
                  <Typography variant="body1" component="span">
                     {data.monthly?.totalCostWithFreight.toLocaleString()}
                  </Typography>
               </div>
            </div>
         </Paper>
      </Grid>
   );
};
