import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PerformanceChart = ({ data, type = 'line', title, height = 300 }) => {
  const chartRef = useRef(null);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          usePointStyle: true
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: '600',
          family: "'Inter', sans-serif"
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
          weight: '600'
        },
        bodyFont: {
          size: 12
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + '%';
            }
            return label;
          }
        }
      }
    },
    scales: type !== 'doughnut' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          },
          callback: function(value) {
            return value + '%';
          }
        }
      }
    } : {}
  };

  const getChartData = () => {
    if (type === 'line') {
      return {
        labels: data.labels || ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          {
            label: 'Engagement Score',
            data: data.engagement || [65, 72, 78, 85],
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Completion Rate',
            data: data.completion || [70, 75, 82, 88],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      };
    } else if (type === 'bar') {
      return {
        labels: data.labels || ['Algorithms', 'Data Structures', 'Graph Theory', 'Dynamic Programming'],
        datasets: [
          {
            label: 'Topic Performance',
            data: data.scores || [88, 92, 65, 72],
            backgroundColor: [
              'rgba(99, 102, 241, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(251, 146, 60, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderRadius: 8,
            borderWidth: 0
          }
        ]
      };
    } else if (type === 'doughnut') {
      return {
        labels: data.labels || ['Completed', 'In Progress', 'Not Started'],
        datasets: [
          {
            data: data.values || [65, 25, 10],
            backgroundColor: [
              'rgba(34, 197, 94, 0.9)',
              'rgba(251, 146, 60, 0.9)',
              'rgba(156, 163, 175, 0.9)'
            ],
            borderWidth: 2,
            borderColor: '#fff'
          }
        ]
      };
    }
    return { labels: [], datasets: [] };
  };

  const ChartComponent = type === 'line' ? Line : type === 'bar' ? Bar : Doughnut;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div style={{ height: `${height}px` }}>
        <ChartComponent
          ref={chartRef}
          data={getChartData()}
          options={chartOptions}
        />
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
