import { useState } from 'react';

function StockAveraging() {
  const [holdPrice, setHoldPrice] = useState('');
  const [holdQty, setHoldQty] = useState('');
  const [avgPrice, setAvgPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');

  const handleCalculate = () => {
    const totalCost = parseFloat(holdPrice) * parseFloat(holdQty) + parseFloat(newPrice) * parseFloat(newQty);
    const totalQty = parseFloat(holdQty) + parseFloat(newQty);
    setAvgPrice((totalCost / totalQty).toFixed(2));
  };

  return (
    <div>
      <h3>🧮 물타기 계산기</h3>
      <input placeholder="보유 단가" value={holdPrice} onChange={e => setHoldPrice(e.target.value)} />
      <input placeholder="보유 수량" value={holdQty} onChange={e => setHoldQty(e.target.value)} />
      <input placeholder="물타기 단가" value={newPrice} onChange={e => setNewPrice(e.target.value)} />
      <input placeholder="물타기 수량" value={newQty} onChange={e => setNewQty(e.target.value)} />
      <button onClick={handleCalculate}>계산</button>
      {avgPrice && <p>📊 새로운 평균 단가: {avgPrice}원</p>}
    </div>
  );
}

export default StockAveraging;
