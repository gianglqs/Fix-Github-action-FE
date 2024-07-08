import { Button, Grid, Typography } from '@mui/material';
import LineChart from '../chart/Line';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatDate } from '@/utils/formatCell';
import { useTranslation } from 'react-i18next';
//components
import Slider from '@mui/material/Slider';

const ChartView: React.FC<any> = ({
   chartData,
   index,
   tooltip,
   currentCurrency,
   handleCloseItem,
}) => {
   const { t } = useTranslation();
   const chartRef = useRef({} as any);
   const [scaleX, setScaleX] = useState([0, 0]);
   const [scaleY, setScaleY] = useState([0, 0]);
   const [scaleY1, setScaleY1] = useState([0, 0]);
   const [xBoundary, setXBoundary] = useState([0, 0]);
   const [yBoundary, setYBoundary] = useState([0, 0]);
   const [y1Boundary, setY1Boundary] = useState([0, 0]);

   const isJPY = chartData[index].title.includes('JPY');
   const yTitle =
      chartData[index]?.data?.datasets
         ?.map((data) => data.label)
         ?.filter((currency) => currency != 'JPY')
         ?.join(' ') || '';
   //get chart axis boundary after first render
   useEffect(() => {
      setXBoundary([chartRef.current.scales.x.min * 0.9, chartRef.current.scales.x.max * 1.1]);
      setYBoundary([chartRef.current.scales.y.min * 0.9, chartRef.current.scales.y.max * 1.1]);
      setScaleY([
         chartRef.current.scales.y.min * 0.9 * 100,
         chartRef.current.scales.y.max * 1.1 * 100,
      ]);

      setY1Boundary([chartRef.current.scales.y1.min, chartRef.current.scales.y1.max]);
      setScaleY1([chartRef.current.scales.y1?.min * 100, chartRef.current.scales.y1?.max * 100]);
   }, []);
   let chartItemScales = {
      y1: {
         title: {
            text: 'JPY',
            display: true,
         },
         position: 'right',
         grid: {
            drawOnChartArea: false, // only want the grid lines for one axis to show up
         },
         display: false,
      },
      y: {
         title: {
            text: yTitle,
            display: true,
         },
         ticks: {
            callback: function (value) {
               return Number(value.toFixed(6));
            },
         },
      },
      x: {
         title: {
            text: '',
            display: true,
         },
      },
   } as any;
   if (yBoundary[1] != 0) {
      chartItemScales.y.max = scaleY[1] / 100;
      chartItemScales.y.min = scaleY[0] / 100;
   }

   if (y1Boundary[1] != 0 && isJPY) {
      chartItemScales.y1.display = true;
      chartItemScales.y1.min = scaleY1[0] / 100;
      chartItemScales.y1.max = scaleY1[1] / 100;
   }
   return (
      <Grid
         container
         sx={{
            marginTop: 1,
            marginBottom: 1,
            marginLeft: 2,
            marginRight: 2,
            border: '0.5 px solid black',
            borderRadius: 5,
            boxShadow: 5,
         }}
      >
         <Button
            id={index}
            variant="contained"
            sx={{ width: 50, height: 20, margin: 1 }}
            onClick={(item) => handleCloseItem(item)}
         >
            Close
         </Button>

         <div
            id={`chart-${index}`}
            style={{
               width: '90%',
               height: 'fit-content',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
            }}
         >
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <div
                  style={{
                     display: 'flex',
                     height: '50vh',
                     gap: '10px',
                     width: '100%',
                     justifyContent: 'center',
                     alignItems: 'center',
                  }}
               >
                  <div
                     style={{
                        height: '50%',
                        order: 1,
                     }}
                  >
                     {yBoundary[1] && (
                        <Slider
                           max={yBoundary[1] * 100}
                           min={yBoundary[0] * 100}
                           value={scaleY}
                           onChange={(option, value) => {
                              setScaleY(value as number[]);
                           }}
                           orientation="vertical"
                        />
                     )}
                  </div>
                  <Grid
                     item
                     sx={{
                        width: '100%',
                        height: '50vh',
                        margin: 'auto',
                        order: 2,
                        flex: 1,
                     }}
                  >
                     <LineChart
                        ref={chartRef}
                        chartData={chartData[index].data}
                        chartName={chartData[index].title}
                        scales={chartItemScales}
                        tooltip={tooltip}
                        hover={{
                           mode: 'index',
                           intersect: false,
                        }}
                     />
                  </Grid>
                  <div
                     style={{
                        height: '50%',
                        order: 3,
                     }}
                  >
                     {y1Boundary[1] && isJPY && (
                        <Slider
                           max={y1Boundary[1] * 100}
                           min={y1Boundary[0] * 100}
                           value={scaleY1}
                           onChange={(option, value) => {
                              setScaleY1(value as number[]);
                           }}
                           orientation="vertical"
                        />
                     )}
                  </div>
               </div>
               {/*<div style={{ width: '60%' }}>
                  <Slider
                     max={100}
                     value={50}
                     onChange={(option, value) => {
                        setScaleX(value as number[]);
                     }}
                  />
               </div>*/}
            </div>
            <Grid
               item
               sx={{
                  width: '50vh',
                  height: 'fit-content',
               }}
            >
               <ul>
                  {chartData[index].conclusion.weakening.length > 0 ? (
                     <li>
                        <Typography fontSize={16}>
                           {currentCurrency} {t('exchangeRates.weakeningText')}
                        </Typography>{' '}
                        <ul>
                           {_.map(chartData[index].conclusion.weakening, (item) => (
                              <li>
                                 <Typography fontSize={14}>{item}</Typography>
                              </li>
                           ))}
                        </ul>
                     </li>
                  ) : (
                     ''
                  )}

                  {chartData[index].conclusion.stable.length > 0 ? (
                     <li>
                        <Typography fontSize={16}>
                           {currentCurrency} {t('exchangeRates.stableText')}
                           {_.map(
                              chartData[index].conclusion.stable,
                              (item, i) => `${i != '0' ? ', ' : ' '}${item}`
                           )}
                        </Typography>{' '}
                     </li>
                  ) : (
                     ''
                  )}

                  {chartData[index].conclusion.strengthening.length > 0 ? (
                     <li>
                        <Typography fontSize={16}>
                           {currentCurrency} {t('exchangeRates.strengtheningText')}
                        </Typography>{' '}
                        <ul>
                           {_.map(chartData[index].conclusion.strengthening, (item) => (
                              <li>
                                 {' '}
                                 <Typography fontSize={14}>{item}</Typography>
                              </li>
                           ))}
                        </ul>
                     </li>
                  ) : (
                     ''
                  )}
               </ul>
            </Grid>
         </div>
      </Grid>
   );
};
const CurrencyReport: React.FC<any> = (props) => {
   const { chartData, closeAReportItem, itemRef } = props;

   const handleCloseItem = (item) => {
      closeAReportItem(item.target.id);
   };

   const dispatch = useDispatch();
   const { t } = useTranslation();

   const reportContent = () => {
      const otherOptions = _.keysIn(chartData);

      const content = _.map(otherOptions, (index) => {
         const currentCurrency = chartData[index].title.substring(0, 3);
         const tooltip = {
            position: 'nearest',
            interaction: {
               intersect: false,
               mode: 'index',
            },
            callbacks: {
               label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) {
                     label += ': ';
                  }
                  label += `${Number(context.parsed.y.toFixed(6))}`;

                  return label;
               },
            },
         };
         let chartItemScales = {
            y1: {
               title: {
                  text: 'JPY',
                  display: true,
               },
               position: 'right',
               grid: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
               },
               display: false,
            },
            y: {
               ticks: {
                  callback: function (value) {
                     return Number(value.toFixed(6));
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
               <ChartView
                  key={chartData[index].title}
                  index={index}
                  chartData={chartData}
                  chartItemScales={chartItemScales}
                  currentCurrency={currentCurrency}
                  tooltip={tooltip}
                  handleCloseItem={handleCloseItem}
               />
               {/*<Grid
               container
               sx={{
                  marginTop: 1,
                  marginBottom: 1,
                  marginLeft: 2,
                  marginRight: 2,
                  border: '0.5 px solid black',
                  borderRadius: 5,
                  boxShadow: 5,
               }}
            >
               <Button
                  id={index}
                  variant="contained"
                  sx={{ width: 50, height: 20, margin: 1 }}
                  onClick={(item) => handleCloseItem(item)}
               >
                  Close
               </Button>

               <div
                  id={`chart-${index}`}
                  style={{
                     width: '90%',
                     height: 'fit-content',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'space-between',
                  }}
               >
                  <Grid
                     item
                     sx={{
                        width: '80vh',
                        height: '40vh',
                        margin: 'auto',
                     }}
                  >
                     <LineChart
                        chartData={chartData[index].data}
                        chartName={chartData[index].title}
                        scales={chartItemScales}
                        tooltip={tooltip}
                     />
                  </Grid>
                  <Grid
                     item
                     sx={{
                        width: '50vh',
                        height: 'fit-content',
                     }}
                  >
                     <ul>
                        {chartData[index].conclusion.weakening.length > 0 ? (
                           <li>
                              <Typography fontSize={16}>
                                 {currentCurrency} {t('exchangeRates.weakeningText')}
                              </Typography>{' '}
                              <ul>
                                 {_.map(chartData[index].conclusion.weakening, (item) => (
                                    <li>
                                       <Typography fontSize={14}>{item}</Typography>
                                    </li>
                                 ))}
                              </ul>
                           </li>
                        ) : (
                           ''
                        )}

                        {chartData[index].conclusion.stable.length > 0 ? (
                           <li>
                              <Typography fontSize={16}>
                                 {currentCurrency} {t('exchangeRates.stableText')}
                                 {_.map(
                                    chartData[index].conclusion.stable,
                                    (item, i) => `${i != '0' ? ', ' : ' '}${item}`
                                 )}
                              </Typography>{' '}
                           </li>
                        ) : (
                           ''
                        )}

                        {chartData[index].conclusion.strengthening.length > 0 ? (
                           <li>
                              <Typography fontSize={16}>
                                 {currentCurrency} {t('exchangeRates.strengtheningText')}
                              </Typography>{' '}
                              <ul>
                                 {_.map(chartData[index].conclusion.strengthening, (item) => (
                                    <li>
                                       {' '}
                                       <Typography fontSize={14}>{item}</Typography>
                                    </li>
                                 ))}
                              </ul>
                           </li>
                        ) : (
                           ''
                        )}
                     </ul>
                  </Grid>
               </div>
            </Grid>*/}
            </>
         );
      });

      return (
         <Grid
            container
            sx={{
               height: '80vh',
               overflowY: 'scroll',
            }}
            ref={itemRef}
         >
            {content}
         </Grid>
      );
   };
   return <>{reportContent()}</>;
};

export { CurrencyReport };
