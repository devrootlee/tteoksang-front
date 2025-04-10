import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import StockPredictor from './StockPredictor';

// 창 크기 추적용 커스텀 훅
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

function StockSearch() {
  const [keyword, setKeyword] = useState('');
  const [stocks, setStocks] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const observer = useRef();
  const inputRef = useRef();
  const { width } = useWindowSize();
  const isMobile = width <= 768;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchStocks = async (searchTerm, pageNum) => {
    if (!searchTerm.trim()) {
      setStocks([]);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get('http://20.196.94.24/:8080/service/stock', {
        params: {
          stockId: searchTerm,
          stockName: searchTerm,
          page: pageNum,
          size: 10,
        },
      });

      const newStocks = res.data.data.stockList;
      setStocks((prev) => pageNum === 0 ? newStocks : [...prev, ...newStocks]);
      setHasMore(newStocks.length === 10);
    } catch (err) {
      console.error('API 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchStocks = useMemo(() => debounce((term) => {
    setPage(0);
    fetchStocks(term, 0);
  }, 500), []);

  const lastStockElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        setPage(prev => prev + 1);
      }
    }, { threshold: 0.1 });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setSelectedStock(null);
    debouncedFetchStocks(keyword);
    return () => debouncedFetchStocks.cancel();
  }, [keyword, debouncedFetchStocks]);

  useEffect(() => {
    if (page > 0) fetchStocks(keyword, page);
  }, [keyword, page]);

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* 상단 콘텐츠 (리스트 + 차트) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        overflow: 'hidden',
      }}>
        {/* 왼쪽 (또는 위쪽) 종목 리스트 */}
        <div style={{
          width: isMobile ? '100%' : '40%',
          height: isMobile ? '50%' : '100%',
          overflowY: 'auto',
          borderRight: isMobile ? 'none' : '1px solid #ddd',
          borderBottom: isMobile ? '1px solid #ddd' : 'none',
          padding: '1rem',
        }}>
          {keyword && (
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
                {stocks.map((stock, index) => {
                  const isLastElement = stocks.length === index + 1;
                  return (
                    <tr
                      key={stock.stockId}
                      ref={isLastElement ? lastStockElementRef : null}
                      onClick={() => handleStockClick(stock)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={tdStyle}>{stock.stockId}</td>
                      <td style={tdStyle}>{stock.stockName}</td>
                      <td style={tdStyle}>{stock.nationType}</td>
                      <td style={tdStyle}>{stock.market}</td>
                    </tr>
                  );
                })}
                {loading && <tr><td colSpan="4" style={tdStyle}>🔍 로딩 중...</td></tr>}
                {!hasMore && stocks.length > 0 && <tr><td colSpan="4" style={tdStyle}>끝</td></tr>}
              </tbody>
            </table>
          )}
        </div>

        {/* 오른쪽 (또는 아래쪽) 차트 */}
        <div style={{
          flex: 1,
          padding: '1rem',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {selectedStock ? (
            <div style={{ width: '100%', maxWidth: '1000px' }}>
              <StockPredictor stock={selectedStock} />
            </div>
          ) : (
            <p style={{ textAlign: 'center' }}>주식을 선택해주세요</p>
          )}
        </div>
      </div>

      {/* 하단 검색창 */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 10,
      }}>
        <input
          ref={inputRef}
          type="text"
          value={keyword}
          placeholder="종목코드 또는 주식명 입력"
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            padding: '1rem',
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto',
            display: 'block',
            border: '2px solid #007bff',
            borderRadius: '8px',
            fontSize: '1.1rem',
            outline: 'none',
            boxShadow: '0 0 5px rgba(0,123,255,0.3)',
          }}
        />
      </div>
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
