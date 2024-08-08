import { Button, Grid, Typography, Box } from '@mui/material';
import LineChart from '../chart/Line';
import _ from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
//components
import Slider from '@mui/material/Slider';
import pptxgen from 'pptxgenjs';

const ChartView: React.FC<any> = ({
   chartData,
   index,
   tooltip,
   currentCurrency,
   handleCloseItem,
   handleExportToPowerPoint,
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

      setY1Boundary([chartRef.current.scales.y1.min * 0.9, chartRef.current.scales.y1.max * 1.1]);
      setScaleY1([
         chartRef.current.scales.y1?.min * 0.9 * 100,
         chartRef.current.scales.y1?.max * 1.1 * 100,
      ]);
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
            display: 'flex',
            flexDirection: 'column',
         }}
      >
         <Box sx={{ display: 'flex' }}>
            <Button
               id={index}
               variant="contained"
               sx={{ height: 25, margin: 1 }}
               onClick={(item) => handleCloseItem(item)}
            >
               Close
            </Button>
            <Button
               id={'export-${index}'}
               variant="contained"
               sx={{ height: 25, margin: 1 }}
               onClick={(item) => handleExportToPowerPoint(item)}
            >
               Export To PowerPoint
            </Button>
         </Box>

         <div
            id={`chart${index}`}
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
                        id={`lineChart` + index}
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
            </div>
            <Grid
               item
               sx={{
                  width: '50vh',
                  height: 'fit-content',
               }}
            >
               <ul id={`comparision` + index}>
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

   /*
   To export a chart to powerpoint file
   */
   const handleExportToPowerPoint = (item) => {
      const imageLink = document.createElement('a');
      const sourceCanvas = document.getElementById('lineChart' + item) as HTMLCanvasElement;
      const sourceContext = sourceCanvas.getContext('2d');

      // Add behind elements.
      sourceContext.globalCompositeOperation = 'destination-over';
      // Now draw!
      sourceContext.fillStyle = 'white';

      imageLink.download = 'exchangRateChart.png';
      imageLink.href = sourceCanvas.toDataURL('image/png', 1);

      //to download image separately
      //imageLink.click();

      // 1. Create a Presentation
      let pres = new pptxgen();

      // 2. Add a Slide to the presentation
      let slide = pres.addSlide();

      // 3. Add 1+ objects (Tables, Shapes, etc.) to the Slide
      slide.addImage({
         x: 0.5,
         y: 0.5,
         w: 9,
         h: 4,
         data: sourceCanvas.toDataURL('image/png', 1),
      });

      const comparisionTextHTML = document.getElementById('comparision' + item);

      const { htmlToText } = require('html-to-text');

      const text = htmlToText(comparisionTextHTML.innerHTML, {
         wordwrap: 130,
      });

      // Add comparison text
      slide.addText(text, {
         x: 1,
         y: 5.0,
         w: '90%',
         margin: 0.5,
         fontFace: 'Arial',
         fontSize: 12,
         color: '000000',
         bold: false,
         isTextBox: true,
      });

      // 4. Save the Presentation
      pres.writeFile({ fileName: 'exchange-rate.pptx' });
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
                  handleExportToPowerPoint={(e) => handleExportToPowerPoint(index)}
               />
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
