import { AppAutocomplete, AppLayout } from '@/components';
import { trendsStore } from '@/store/reducers';
import { Button, Grid } from '@mui/material';
import axios from 'axios';
import { produce } from 'immer';
import { parseCookies } from 'nookies';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defaultValueFilterTrends } from '@/utils/defaultValues';
import _ from 'lodash';

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
import LineChart from '@/components/chart/Line';
import ChartAnnotation from 'chartjs-plugin-annotation';
import trendsApi from '@/api/trends.api';

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

import { checkTokenBeforeLoadPage } from '@/utils/checkTokenBeforeLoadPage';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
   return await checkTokenBeforeLoadPage(context);
}

export default function Trends() {
   const dispatch = useDispatch();

   // select data Filter in store
   const initDataFilter = useSelector(trendsStore.selectInitDataFilter);

   const [dataFilter, setDataFilter] = useState(defaultValueFilterTrends);
   console.log(initDataFilter);

   const dataForMarginVsCost = useSelector(trendsStore.selectDataForMarginVsCost);
   const dataForMarginVsDN = useSelector(trendsStore.selectDataForMarginVsDN);

   const handleChangeDataFilter = (option, field) => {
      setDataFilter((prev) =>
         produce(prev, (draft) => {
            if (_.includes(['year'], field)) {
               draft[field] = option.value;
            } else {
               draft[field] = option.map(({ value }) => value);
            }
         })
      );
   };

   useEffect(() => {
      handleFilterTrends();
   }, [dataFilter]);

   const handleFilterTrends = async () => {
      dispatch(trendsStore.actions.setDefaultValueFilterTrends(dataFilter));
      dispatch(trendsStore.sagaGetList());
   };

   const mapMarginPercentageValue = (marginData) => {
      console.log(marginData);
      const chartMargin = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      marginData.forEach((item) => {
         chartMargin[item.month - 1] = item.marginPercentage * 100;
      });
      return chartMargin;
   };

   const mapCostValue = (costData) => {
      console.log(costData);
      const chartMargin = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      costData.forEach((item) => {
         chartMargin[item.month - 1] = item.cost;
      });
      return chartMargin;
   };

   useEffect(() => {
      try {
         const labels = dataForMarginVsCost['bookingData'].map((item) => item.monthYear);

         //getting Margin vs TotalCost data
         const bookingMarginPercentage = mapMarginPercentageValue(
            dataForMarginVsCost['bookingData']
         );
         const bookingCost = mapCostValue(dataForMarginVsCost['bookingData']);
         const shipmentMarginPercentage = mapMarginPercentageValue(
            dataForMarginVsCost['shipmentData']
         );
         const shipmentCost = mapCostValue(dataForMarginVsCost['shipmentData']);

         //getting Margin vs DealerNet data
         const DNlabels = dataForMarginVsCost['bookingData'].map((item) => item.monthYear);
         const DNbookingMarginPercentage = mapMarginPercentageValue(
            dataForMarginVsDN['bookingData']
         );
         const bookingDN = mapCostValue(dataForMarginVsDN['bookingData']);
         const DNshipmentMarginPercentage = mapMarginPercentageValue(
            dataForMarginVsDN['shipmentData']
         );
         const shipmentDN = mapCostValue(dataForMarginVsDN['shipmentData']);

         console.log(bookingMarginPercentage);

         setMarginVsCostData({
            labels: labels,
            datasets: [
               {
                  label: 'Booking Margin %',
                  data: bookingMarginPercentage,
                  borderColor: '#eea903',
                  backgroundColor: '#eea903',
                  pointStyle: 'triangle',
                  pointRadius: 10,
                  pointHoverRadius: 15,
                  showLine: false,
                  yAxisID: 'y',
               },
               {
                  label: 'Shipment Margin %',
                  data: shipmentMarginPercentage,
                  borderColor: '#807b7d',
                  backgroundColor: '#807b7d',
                  pointStyle: 'triangle',
                  pointRadius: 10,
                  pointHoverRadius: 15,
                  showLine: false,
                  yAxisID: 'y',
               },
               {
                  label: 'Booking Cost (,000 USD)',
                  data: bookingCost,
                  borderColor: '#eea903',
                  backgroundColor: '#eea903',
                  pointStyle: 'circle',
                  yAxisID: 'y1',
               },
               {
                  label: 'Shipment Cost (,000 USD)',
                  data: shipmentCost,
                  borderColor: '#807b7d',
                  backgroundColor: '#807b7d',
                  pointStyle: 'circle',
                  yAxisID: 'y1',
               },
            ],
         });

         setMarginVsDNData({
            labels: DNlabels,
            datasets: [
               {
                  label: 'Booking Margin %',
                  data: DNbookingMarginPercentage,
                  borderColor: '#eea903',
                  backgroundColor: '#eea903',
                  pointStyle: 'triangle',
                  pointRadius: 10,
                  pointHoverRadius: 15,
                  showLine: false,
                  yAxisID: 'y',
               },
               {
                  label: 'Shipment Margin %',
                  data: DNshipmentMarginPercentage,
                  borderColor: '#807b7d',
                  backgroundColor: '#807b7d',
                  pointStyle: 'triangle',
                  pointRadius: 10,
                  pointHoverRadius: 15,
                  showLine: false,
                  yAxisID: 'y',
               },
               {
                  label: 'Booking Cost (,000 USD)',
                  data: bookingDN,
                  borderColor: '#eea903',
                  backgroundColor: '#eea903',
                  pointStyle: 'circle',
                  yAxisID: 'y1',
               },
               {
                  label: 'Shipment Cost (,000 USD)',
                  data: shipmentDN,
                  borderColor: '#807b7d',
                  backgroundColor: '#807b7d',
                  pointStyle: 'circle',
                  yAxisID: 'y1',
               },
            ],
         });
      } catch (err) {
         console.log(err);
      }
   }, [dataForMarginVsCost]);

   const [marginVsCostData, setMarginVsCostData] = useState({
      labels: [
         'Jan 23',
         'Feb 23',
         'Mar 23',
         'Apr 23',
         'May 23',
         'Jun 23',
         'Jul 23',
         'Aug 23',
         'Sep 23',
         'Oct 23',
         'Nov 23',
         'Dec 23',
      ],
      datasets: [{}],
   });

   const [marginVsDNData, setMarginVsDNData] = useState({
      labels: [
         'Jan 23',
         'Feb 23',
         'Mar 23',
         'Apr 23',
         'May 23',
         'Jun 23',
         'Jul 23',
         'Aug 23',
         'Sep 23',
         'Oct 23',
         'Nov 23',
         'Dec 23',
      ],
      datasets: [{}],
   });

   const chartScales = {
      y1: {
         title: {
            text: 'Cost $',
            display: true,
         },
         ticks: {
            callback: function (value) {
               return '$' + (value / 1000).toLocaleString() + 'K';
            },
         },
         position: 'right',
      },
      y: {
         beginAtZero: true,
         title: {
            text: 'Margin %',
            display: true,
         },
         ticks: {
            callback: function (value) {
               return value + '%';
            },
         },
      },
      x: {
         title: {
            text: '',
            display: true,
         },
      },
   };
   return (
      <>
         <AppLayout entity="trends">
            <Grid container spacing={1}>
               <Grid item xs={2} sx={{ zIndex: 10, height: 25 }}>
                  <AppAutocomplete
                     options={initDataFilter.regions}
                     label="Region"
                     onChange={(e, option) => handleChangeDataFilter(option, 'regions')}
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
                     options={initDataFilter.dealers}
                     label="Dealer"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'dealers')}
                     limitTags={1}
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
                     options={initDataFilter.plants}
                     label="Plant"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'plants')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.metaSeries}
                     label="MetaSeries"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'metaSeries')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.classes}
                     label="Class"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'classes')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>
               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.models}
                     label="Model"
                     sx={{ height: 25, zIndex: 10 }}
                     onChange={(e, option) => handleChangeDataFilter(option, 'models')}
                     limitTags={1}
                     disableListWrap
                     primaryKeyOption="value"
                     multiple
                     disableCloseOnSelect
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.segments}
                     label="Segment"
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option, 'segments')
                     }
                     disableClearable={false}
                     primaryKeyOption="value"
                     limitTags={1}
                     multiple
                     disableListWrap
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <AppAutocomplete
                     options={initDataFilter.years}
                     label="Year"
                     primaryKeyOption="value"
                     onChange={(e, option) =>
                        handleChangeDataFilter(_.isNil(option) ? '' : option, 'year')
                     }
                     disableClearable={false}
                     renderOption={(prop, option) => `${option.value}`}
                     getOptionLabel={(option) => `${option.value}`}
                  />
               </Grid>

               <Grid item xs={2}>
                  <Button
                     variant="contained"
                     sx={{ width: '100%', height: 24 }}
                     onClick={handleFilterTrends}
                  >
                     Filter
                  </Button>
               </Grid>

               <Grid container sx={{ justifyContent: 'left' }}>
                  <Grid
                     item
                     sx={{
                        width: '100%',
                        height: '40vh',
                        margin: 'auto',
                        position: 'relative',
                     }}
                  >
                     <LineChart
                        chartData={marginVsCostData}
                        chartName={'Margin % vs Cost'}
                        scales={chartScales}
                     />
                  </Grid>
                  <Grid
                     item
                     sx={{
                        width: '100%',
                        height: '40vh',
                        margin: 'auto',
                        position: 'relative',
                     }}
                  >
                     <LineChart
                        chartData={marginVsDNData}
                        chartName={'Margin % vs DN'}
                        scales={chartScales}
                     />
                  </Grid>
               </Grid>
            </Grid>
         </AppLayout>
      </>
   );
}
