const createTradeRow = (trade) => {

  const row = document.createElement('tr');
  row.classList.add('trade-row');
  
  const symbol = trade.s || '';
  const price = (parseFloat(trade.p) || '').toFixed(2);
  const quantity = (parseFloat(trade.q) || '').toFixed(5);
  const time = trade.T || '';
  const type = trade.m ? 'Buy' : trade.m === false ? 'Sell' : '';
  const total = (price * quantity).toFixed(2);

  const currencySymbol = symbol.endsWith('USDT') ? '$' : symbol.endsWith('EUR') ? '€' : '$';

  row.innerHTML = `
    <td class="trade-type ${type.toLowerCase()}">${type}</td>
    <td class="trade-symbol">${symbol}</td>
    <td class="trade-quantity-price">${quantity} @ ${formatNumber(price)}</td>
    <td class="trade-total">${currencySymbol}${formatNumber(total)}</td>
    <td class="trade-time"></td>
  `;

  const timeCell = row.querySelector('.trade-time');
  timeCell.textContent = formatTime(time);
  
  setInterval(() => {
    timeCell.textContent = formatTime(time);
  }, 1000);

  const totalCell = row.querySelector('.trade-total');
  const totalValue = parseFloat(total);
  let color = '';

  if (totalValue >= 1000000) {
    color = 'rgba(255, 255, 255, 0.99)';
  } else if (totalValue >= 100000) {
    color = 'rgba(255, 255, 255, 0.80)';
  } else {
    color = 'rgba(255, 255, 255, 0.50)';
  }

  totalCell.style.color = color;

  row.classList.add(type.toLowerCase());
  return row;
};


const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatTime = (time) => {
  const secondsAgo = (Date.now() - time) / 1000;

  if (secondsAgo < 60) {
    return `${Math.floor(secondsAgo)} secs ago`;
  }

  const times = [
    { unit: 'min', seconds: 60 },
    { unit: 'sec', seconds: 1 },
  ];

  for (let i = 0; i < times.length; i++) {
    const unit = times[i].unit;
    const seconds = times[i].seconds;

    if (secondsAgo >= seconds) {
      const num = Math.floor(secondsAgo / seconds);
      return `${num} ${unit}${num === 1 ? '' : 's'} ago`;
    }
  }
}

const btcusdtSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@aggTrade');
const btcbusdSocket = new WebSocket('wss://stream.binance.com:9443/ws/btcbusd@aggTrade');
const btceurSocket = new WebSocket('wss://stream.binance.com:9443/ws/btceur@aggTrade');
const table = document.getElementById('trade-table');
const minValueSelect = document.getElementById('min-value');

const handleMessage = (event) =>  {
  const trade = JSON.parse(event.data);
  const total = parseFloat(trade.p) * parseFloat(trade.q);
  
  if (total >= parseFloat(minValueSelect.value)) {
  const row = createTradeRow(trade);
  table.insertBefore(row, table.firstChild);
  }
  };
  
  btcusdtSocket.onmessage = handleMessage;
  btcbusdSocket.onmessage = handleMessage;
  btceurSocket.onmessage = handleMessage;
