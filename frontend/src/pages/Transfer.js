import config from '../config';

// Replace all http://localhost:5000/api with config.API_URL
const response = await axios.post(`${config.API_URL}/transactions/transfer`, {
  fromAccountId: transferData.fromAccountId,
  toAccountNumber: transferData.toAccountNumber,
  amount: amountNum,
  description: transferData.description.trim() || 'Funds transfer'
}, {
  headers: { Authorization: `Bearer ${token}` }
});