// 중략: import 부분은 그대로 유지
import { useEffect, useState } from 'react';
import axios from 'axios';
import numeral from 'numeral';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

function StockPredictor({ stock }) {
  const [prediction, setPrediction] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [nationType, setNationType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!stock || !stock.stockId || !stock.nationType || !stock.market) {
        setPrediction(null);
        setChartData([]);
        setNationType(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get('http://localhost:8080/service/prediction', {
          params: {
            stockId: stock.stockId,
            nationType: stock.nationType,
            market: stock.market
          }
        });

        const data = res.data?.data || {};
        const chart = Array.isArray(data.chart) ? data.chart : [];
        setChartData(chart);
        setNationType(data.nationType || stock.nationType);
        setPrediction({
          trend: data.trend || '데이터 없음',
          predictedPrice: data.predictedPrice || null
        });
      } catch (error) {
        setPrediction(null);
        setChartData([]);
        setNationType(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [stock]);

  if (loading) return <LoadingSpinner />;
  if (!prediction || !chartData.length || !nationType) return <p>예측 결과를 불러올 수 없습니다.</p>;

  const currentStyles = darkMode ? styles.dark : styles.light;

  return (
    <div style={{ ...styles.card, ...currentStyles.card }}>
      <div style={styles.headerRow}>
        <h2 style={currentStyles.header}>
          📈 {stock?.stockName || '이름 없음'} ({stock?.stockId || 'ID 없음'})
        </h2>
        <button onClick={() => setDarkMode(!darkMode)} style={styles.toggleBtn}>
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={currentStyles.resultSection}>
        <p style={currentStyles.resultText}>
          ✅ <strong>예측 결과:</strong> {prediction.trend}
        </p>
        {prediction.predictedPrice && (
          <p style={currentStyles.resultText}>
            💰 <strong>예측 가격:</strong> {nationType === '한국' ? '₩' : '$'}{' '}
            {numeral(prediction.predictedPrice).format(nationType === '한국' ? '0,0' : '0,0.00')}
          </p>
        )}
      </div>

      <h4 style={currentStyles.chartTitle}>
        차트 ({nationType === '한국' ? '₩' : '$'})
      </h4>
      <Chart chartData={chartData} nationType={nationType} />
    </div>
  );
}

const Chart = ({ chartData, nationType }) => {
  const data = [...(chartData || [])].reverse();
  const symbol = nationType === '한국' ? '₩' : '$';

  if (!data.length) return <p>차트 데이터를 표시할 수 없습니다.</p>;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) =>
            date ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}` : 'N/A'
          }
        />
        <YAxis
          tickFormatter={(value) =>
            `${symbol} ${numeral(value || 0).format(nationType === '한국' ? '0,0a' : '0.[0]a').toUpperCase()}`
          }
        />
        <Tooltip
          labelFormatter={(date) =>
            date ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}` : 'N/A'
          }
          formatter={(value, name) => [
            `${symbol} ${numeral(value || 0).format(nationType === '한국' ? '0,0' : '0,0.00')}`,
            name
          ]}
        />
        <Legend />
        <Line type="monotone" dataKey="closePrice" stroke="#3498db" name="종가" dot={false} />
        <Line type="monotone" dataKey="sma" stroke="#2ecc71" name="SMA" dot={false} />
        <Line type="monotone" dataKey="ema" stroke="#e67e22" name="EMA" dot={false} />
        <Line type="monotone" dataKey="linear" stroke="#e74c3c" name="선형회귀" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

const LoadingSpinner = () => (
  <div style={{ textAlign: 'center', padding: '1rem' }}>
    <div className="spinner" />
    <style>
      {`
        .spinner {
          width: 40px;
          height: 40px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #e74c3c;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          h2 {
            font-size: 1rem !important;
          }

          .spinner {
            width: 30px;
            height: 30px;
          }
        }
      `}
    </style>
  </div>
);

const styles = {
  card: {
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    marginBottom: '2rem',
    transition: 'all 0.3s ease',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  headerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  toggleBtn: {
    padding: '0.4rem 1rem',
    fontSize: '0.9rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    backgroundColor: '#f1f1f1',
  },
  light: {
    card: {
      backgroundColor: '#ffffff',
    },
    header: {
      fontSize: '1.25rem',
      color: '#2c3e50',
    },
    resultSection: {
      marginBottom: '1.5rem',
    },
    resultText: {
      fontSize: '1rem',
      marginBottom: '0.5rem',
      color: '#333',
    },
    chartTitle: {
      marginBottom: '0.5rem',
      color: '#34495e',
      fontSize: '1rem',
    },
  },
  dark: {
    card: {
      backgroundColor: '#1e1e1e',
      color: '#f0f0f0',
    },
    header: {
      fontSize: '1.25rem',
      color: '#f0f0f0',
    },
    resultSection: {
      marginBottom: '1.5rem',
    },
    resultText: {
      fontSize: '1rem',
      marginBottom: '0.5rem',
      color: '#f0f0f0',
    },
    chartTitle: {
      marginBottom: '0.5rem',
      color: '#ddd',
      fontSize: '1rem',
    },
  },
};

export default StockPredictor;
