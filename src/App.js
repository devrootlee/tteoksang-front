import { useState, useEffect } from 'react';
import StockSearch from './components/StockSearch';
import './App.css';

// 창 크기 추적용 훅
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

function App() {
  const { width, height } = useWindowSize();
  const isMobile = width <= 768;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* 상단 타이틀 */}
      <header style={{ padding: '1.2rem 1.5rem 0.8rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#2c3e50' }}>🚀 떡상</h1>
      </header>

      {/* 메인 컨텐츠 */}
      <main
        style={{
          padding: '0 1rem 1.5rem',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <section
          style={{
            ...modernCardStyle,
            flexDirection: isMobile ? 'column' : 'row',
            height: `calc(${height}px - 130px)`, // header + padding 고려한 높이
          }}
        >
          <div style={{ flex: 1, padding: '1rem', minWidth: 0 }}>
            <h2 style={cardTitle}>📈 주가 예측기</h2>
            <StockSearch />
          </div>
        </section>
      </main>
    </div>
  );
}

// 카드 기본 스타일
const modernCardStyle = {
  width: '100%',
  maxWidth: '1000px',
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  padding: '0.5rem',
  display: 'flex',
  overflow: 'hidden',
};

const cardTitle = {
  margin: '0 0 1rem 0',
  fontSize: '1.3rem',
  color: '#1a2e44',
  fontWeight: '900',
};

export default App;
