import React from 'react';
import { Line } from 'react-chartjs-2';

function LineChart({ chartData }) {
   return (
      <div className="chart-container">
         <Line
            data={chartData}
            options={{
               plugins: {
                  title: {
                     display: true,
                     text: 'Users Gained between 2016-2020',
                  },
                  legend: {
                     display: true,
                  },
                  tooltip: {
                     enabled: true,
                  },
               },
            }}
         />
      </div>
   );
}
export default LineChart;
