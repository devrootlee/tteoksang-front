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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      if (!stock || !stock.stockId || !stock.nationType || !stock.market) {
        console.error('Stock 데이터가 유효하지 않습니다:', stock);
        setPrediction(null);
        setChartData([]);
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

        const chart = Array.isArray(res.data?.data?.chart) ? res.data.data.chart : [];
        setChartData(chart);
        setPrediction({
          result: res.data?.data?.result || '데이터 없음',
          confidence: res.data?.data?.confidence || '알 수 없음',
        });
      } catch (error) {
        console.error('예측 데이터 불러오기 실패', error);
        setPrediction(null);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [stock]);

  if (loading) return <LoadingSpinner />;

  if (!prediction || !chartData.length) {
    return <p>예측 결과를 불러올 수 없습니다.</p>;
  }

  return (
    <div style={styles.card}>
      <h2 style={styles.header}>
        📈 {stock?.stockName || '이름 없음'} ({stock?.stockId || 'ID 없음'})
      </h2>

      <div style={styles.resultSection}>
        <p style={styles.resultText}>
          ✅ <strong>예측 결과:</strong> {prediction.result}
        </p>
        <p
          style={{
            ...styles.confidence,
            color: prediction.confidence === '높음' ? '#27ae60' : '#e67e22'
          }}
        >
          🧠 신뢰도: {prediction.confidence}
        </p>
      </div>

      <h4 style={styles.chartTitle}>
        차트 ({stock?.nationType === '한국' ? '₩' : '$'})
      </h4>
      <Chart chartData={chartData} nationType={stock?.nationType || '한국'} />
    </div>
  );
}

const Chart = ({ chartData, nationType }) => {
  const data = [...(chartData || [])].reverse();
  const symbol = nationType === '한국' ? '₩' : '$';

  if (!data.length) {
    return <p>차트 데이터를 표시할 수 없습니다.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) =>
            date
              ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`
              : 'N/A'
          }
        />
        <YAxis
          tickFormatter={(value) =>
            `${symbol} ${numeral(value || 0).format('0.[0]a').toUpperCase()}`
          }
        />
        <Tooltip
          labelFormatter={(date) =>
            date
              ? `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`
              : 'N/A'
          }
          formatter={(value, name) => [
            `${symbol} ${numeral(value || 0).format('0,0')}`,
            name
          ]}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="closePrice"
          stroke="#3498db"
          name="종가"
          dot={false}
        />
        <Line type="monotone" dataKey="sma" stroke="#2ecc71" name="SMA" dot={false} />
        <Line type="monotone" dataKey="ema" stroke="#e67e22" name="EMA" dot={false} />
        <Line
          type="monotone"
          dataKey="linear"
          stroke="#e74c3c"
          name="선형회귀"
          dot={false}
        />
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
      `}
    </style>
  </div>
);

const styles = {
  card: {
    padding: '1.5rem',
    border: '1px solid #ddd',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    marginBottom: '2rem',
  },
  header: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#2c3e50',
  },
  resultSection: {
    marginBottom: '1.5rem',
  },
  resultText: {
    fontSize: '1rem',
    marginBottom: '0.5rem',
  },
  confidence: {
    fontWeight: 'bold',
  },
  chartTitle: {
    marginBottom: '0.5rem',
    color: '#34495e',
    fontSize: '1rem',
  },
};

export default StockPredictor;