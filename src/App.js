import StockSearch from './components/StockSearch';
import StockAveraging from './components/StockAveraging';
import MostPredicted from './components/MostPredicted';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {/* 상단 타이틀 */}
      <header style={{ padding: '2rem 2rem 1rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem', color: '#2c3e50' }}>🚀 떡상</h1>
      </header>

      {/* 3분할 레이아웃 */}
      <main
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 2rem 2rem',
          gap: '2rem',
        }}
      >
        {/* 왼쪽: 물타기 */}
        <section style={cardStyle}>
          <h2 style={cardTitle}>📉 물타기</h2>
          <StockAveraging />
        </section>

        {/* 가운데: 예측기 */}
        <section style={{ ...cardStyle, flex: 2 }}>
          <h2 style={cardTitle}>📈 떡상 예측기</h2>
          <StockSearch />
        </section>

        {/* 오른쪽: 순위 */}
        <section style={cardStyle}>
          <h2 style={cardTitle}>🏆 예측 순위</h2>
          <MostPredicted />
        </section>
      </main>
    </div>
  );
}

const cardStyle = {
  flex: 1,
  backgroundColor: '#fff',
  borderRadius: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  minHeight: '500px',
};

const cardTitle = {
  margin: '0 0 1rem 0',
  fontSize: '1.25rem',
  color: '#34495e',
};

export default App;
