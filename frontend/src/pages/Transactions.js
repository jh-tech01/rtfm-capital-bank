import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/transactions/history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error('Fetch transactions error:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (transaction) => {
    if (transaction.impact > 0) return 'text-success';
    if (transaction.impact < 0) return 'text-danger';
    return 'text-secondary';
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.impact > 0) return '↓';
    if (transaction.impact < 0) return '↑';
    return '→';
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Transaction History</h4>
            <select 
              className="form-select w-auto bg-light"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="transfer">Transfers</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>
        </div>
        
        <div className="card-body">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No transactions found</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => (
                    <tr key={transaction._id}>
                      <td>{formatDate(transaction.createdAt)}</td>
                      <td>
                        <div>
                          <strong>{transaction.description}</strong>
                          <div className="small text-muted">
                            {transaction.type === 'transfer' && (
                              transaction.direction === 'outgoing' 
                                ? `To: ${transaction.toAccount?.accountNumber}`
                                : `From: ${transaction.fromAccount?.accountNumber}`
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={getTransactionColor(transaction)}>
                        <strong>
                          {getTransactionIcon(transaction)} 
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <span className="badge bg-success">
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;