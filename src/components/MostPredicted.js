function MostPredicted() {
    const mockRanking = [
      { rank: 1, name: '삼성전자', count: 32 },
      { rank: 2, name: '카카오', count: 28 },
      { rank: 3, name: '네이버', count: 25 },
      { rank: 4, name: 'LG에너지솔루션', count: 20 },
      { rank: 5, name: '현대차', count: 19 },
      { rank: 6, name: '셀트리온', count: 17 },
      { rank: 7, name: '하이브', count: 16 },
      { rank: 8, name: '삼성SDI', count: 15 },
      { rank: 9, name: 'SK하이닉스', count: 13 },
      { rank: 10, name: '포스코홀딩스', count: 11 },
    ];
  
    return (
      <div>
        <h3>🏆 가장 많이 예측한 주식</h3>
        <ol>
          {mockRanking.map((stock) => (
            <li key={stock.rank}>
              {stock.rank}. {stock.name} ({stock.count}회)
            </li>
          ))}
        </ol>
      </div>
    );
  }
  
  export default MostPredicted;
  