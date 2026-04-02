import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    accountType: 'savings',
    currency: 'USD'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/accounts');
      setAccounts(response.data);
    } catch (err) {
      toast.error('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/accounts', newAccount);
      setAccounts([...accounts, response.data]);
      setShowCreateForm(false);
      toast.success('Account created successfully!');
      setNewAccount({ accountType: 'savings', currency: 'USD' });
    } catch (err) {
      toast.error('Failed to create account');
    }
  };

  const getAccountTypeBadge = (type) => {
    const colors = {
      savings: 'badge bg-success',
      checking: 'badge bg-info',
      business: 'badge bg-warning'
    };
    return colors[type] || 'badge bg-secondary';
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'badge bg-success',
      inactive: 'badge bg-secondary',
      frozen: 'badge bg-danger'
    };
    return colors[status] || 'badge bg-secondary';
  };

  if (loading) {
    return <div className="text-center mt-5">Loading accounts...</div>;
  }

  return (
    <div className="accounts-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Accounts</h1>
        <button 
          className="btn btn-success"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : 'Open New Account'}
        </button>
      </div>

      {showCreateForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>Open New Account</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateAccount}>
              <div className="row">
                <div className="col-md-5">
                  <div className="form-group">
                    <label className="form-label">Account Type</label>
                    <select
                      className="form-control"
                      value={newAccount.accountType}
                      onChange={(e) => setNewAccount({...newAccount, accountType: e.target.value})}
                      required
                    >
                      <option value="savings">Savings Account</option>
                      <option value="checking">Checking Account</option>
                      <option value="business">Business Account</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-control"
                      value={newAccount.currency}
                      onChange={(e) => setNewAccount({...newAccount, currency: e.target.value})}
                      required
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100">
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="alert alert-info">
          You don't have any accounts yet. Click "Open New Account" to get started!
        </div>
      ) : (
        <div className="row">
          {accounts.map(account => (
            <div key={account._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">{account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account</h5>
                  <span className={getStatusBadge(account.status)}>
                    {account.status}
                  </span>
                </div>
                <div className="card-body">
                  <p className="mb-2">
                    <strong>Account Number:</strong> {account.accountNumber}
                  </p>
                  <p className="mb-2">
                    <strong>Balance:</strong> ${account.balance.toLocaleString()} {account.currency}
                  </p>
                  <p className="mb-2">
                    <strong>Account Type:</strong> 
                    <span className={getAccountTypeBadge(account.accountType)} style={{ marginLeft: '10px' }}>
                      {account.accountType}
                    </span>
                  </p>
                  <p className="mb-3">
                    <strong>Opened:</strong> {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                  <div className="btn-group w-100">
                    <Link to={`/transactions?account=${account._id}`} className="btn btn-info">
                      View Transactions
                    </Link>
                    <Link to={`/transfer?from=${account._id}`} className="btn btn-primary">
                      Transfer from this account
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Accounts;