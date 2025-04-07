import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import StockPredictor from './StockPredictor';

function StockSearch() {
  const [keyword, setKeyword] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  const fetchStocks = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setStocks([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/service/stock', {
        params: {
          stockId: searchTerm,
          stockName: searchTerm,
          page: 0,
          size: 100,
        },
      });

      setStocks(res.data.data.stockList);
    } catch (err) {
      console.error('API 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchStocks = useMemo(() => debounce(fetchStocks, 500), []);

  useEffect(() => {
    setSelectedStock(null);
    debouncedFetchStocks(keyword);
    return () => {
      debouncedFetchStocks.cancel();
    };
  }, [keyword, debouncedFetchStocks]);

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
  };

  return (
    <div
      style={{
        width: '500px',
        margin: '0 auto',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      {/* 📈 예측기 영역 - 항상 고정 */}
      <div
        style={{
          borderBottom: '1px solid #ccc',
          paddingBottom: '0.5rem',
        }}
      >
        <h2 style={{ marginBottom: '0.5rem' }}>📈 떡상 예측기</h2>
        {selectedStock && <StockPredictor stock={selectedStock} />}
      </div>

      {/* 🔍 검색창 */}
      <input
        type="text"
        value={keyword}
        placeholder="종목코드 또는 주식명 입력"
        onChange={(e) => setKeyword(e.target.value)}
        style={{
          padding: '0.75rem',
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '6px',
        }}
      />

      {/* 검색 결과 리스트 */}
      {keyword && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '6px',
            maxHeight: '300px',
            overflowY: 'auto',
            backgroundColor: '#fff',
          }}
        >
          {loading ? (
            <p style={{ padding: '1rem' }}>🔍 검색 중...</p>
          ) : stocks.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>종목코드</th>
                  <th style={thStyle}>주식명</th>
                  <th style={thStyle}>국가</th>
                  <th style={thStyle}>시장</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.stockId}
                    onClick={() => handleStockClick(stock)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={tdStyle}>{stock.stockId}</td>
                    <td style={tdStyle}>{stock.stockName}</td>
                    <td style={tdStyle}>{stock.nationType}</td>
                    <td style={tdStyle}>{stock.market}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: '1rem' }}>🔎 검색 결과가 없습니다.</p>
          )}
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: '8px',
  borderBottom: '1px solid #ddd',
  fontWeight: 'bold',
  textAlign: 'center',
  backgroundColor: '#f9f9f9',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tdStyle = {
  padding: '8px',
  borderBottom: '1px solid #eee',
  textAlign: 'center',
};

export default StockSearch;
