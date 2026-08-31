const directions = [
  { id: 1, from: 'USDT', to: 'RUB', rate: 91.84, fee: 0.7, min: 100, max: 100000 },
  { id: 2, from: 'RUB', to: 'USDT', rate: 94.16, fee: 0.9, min: 10000, max: 10000000 },
  { id: 3, from: 'BTC', to: 'RUB', rate: 6942550, fee: 1.1, min: 0.01, max: 20 },
  { id: 4, from: 'ETH', to: 'RUB', rate: 318420, fee: 1, min: 0.1, max: 200 },
];

const amount = document.querySelector('#amount');
const selector = document.querySelector('#direction');
const result = document.querySelector('#result');
const hint = document.querySelector('#amountHint');
const modal = document.querySelector('#modal');

const format = (value, currency) => new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: ['USDT', 'BTC', 'ETH'].includes(currency) ? 4 : 0,
}).format(value);
const formatRate = (value) => new Intl.NumberFormat('ru-RU', {
  minimumFractionDigits: value < 1000 && !Number.isInteger(value) ? 2 : 0,
  maximumFractionDigits: 2,
}).format(value);

const coinName = (currency) => currency.toLowerCase();
const current = () => directions.find((item) => item.id === Number(selector.value)) || directions[0];

directions.forEach((item) => {
  const option = document.createElement('option');
  option.value = String(item.id);
  option.textContent = `${item.from} → ${item.to}`;
  selector.append(option);
});

const calculate = () => {
  const item = current();
  const value = Number(String(amount.value).replace(',', '.')) || 0;
  const converted = item.from === 'RUB' ? value / item.rate : value * item.rate;
  const total = converted * (1 - item.fee / 100);
  document.querySelector('#fromCurrency').textContent = item.from;
  document.querySelector('#toCurrency').textContent = item.to;
  const fromCoin = document.querySelector('#fromCoin');
  const toCoin = document.querySelector('#toCoin');
  fromCoin.className = `coin ${coinName(item.from)}`;
  toCoin.className = `coin ${coinName(item.to)}`;
  fromCoin.textContent = item.from[0];
  toCoin.textContent = item.to[0];
  result.textContent = format(total, item.to);
  document.querySelector('#rate').textContent = item.from === 'RUB'
    ? `1 ${item.to} = ${formatRate(item.rate)} ${item.from}`
    : `1 ${item.from} = ${formatRate(item.rate)} ${item.to}`;
  document.querySelector('#fee').textContent = `${String(item.fee).replace('.', ',')}% · уже учтена`;
  const invalid = value > 0 && (value < item.min || value > item.max);
  hint.textContent = invalid ? `Допустимо от ${format(item.min, item.from)} до ${format(item.max, item.from)} ${item.from}` : '';
  document.querySelector('#modalFrom').textContent = `${format(value, item.from)} ${item.from}`;
  document.querySelector('#modalTo').textContent = `${format(total, item.to)} ${item.to}`;
  document.querySelector('#openModal').disabled = !value || invalid;
};

directions.forEach((item) => {
  const row = document.createElement('div');
  row.className = 'rate-row';
  row.innerHTML = `<span><i class="coin ${coinName(item.from)}">${item.from[0]}</i>${item.from}</span><span><i class="coin ${coinName(item.to)}">${item.to[0]}</i>${item.to}</span><strong>1 : ${formatRate(item.rate)}</strong><small>${String(item.fee).replace('.', ',')}%</small><button type="button" aria-label="Выбрать ${item.from} в ${item.to}">→</button>`;
  row.querySelector('button').addEventListener('click', () => {
    selector.value = String(item.id);
    calculate();
    document.querySelector('#exchange').scrollIntoView({ behavior: 'smooth' });
  });
  document.querySelector('#rateTable').append(row);
});

document.querySelector('#swap').addEventListener('click', () => {
  const item = current();
  const reverse = directions.find((candidate) => candidate.from === item.to && candidate.to === item.from);
  if (reverse) selector.value = String(reverse.id);
  calculate();
});

amount.addEventListener('input', calculate);
selector.addEventListener('change', calculate);

const openModal = () => {
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  modal.querySelector('input').focus();
};
const closeModal = () => {
  modal.hidden = true;
  document.body.style.overflow = '';
};

document.querySelector('#openModal').addEventListener('click', openModal);
document.querySelector('#openModal2').addEventListener('click', openModal);
document.querySelector('#closeModal').addEventListener('click', closeModal);
document.querySelector('#done').addEventListener('click', closeModal);
modal.addEventListener('mousedown', (event) => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

document.querySelectorAll('.pills button').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.pills button').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
}));

document.querySelector('#demoForm').addEventListener('submit', (event) => {
  event.preventDefault();
  event.currentTarget.hidden = true;
  document.querySelector('#success').hidden = false;
});

calculate();
