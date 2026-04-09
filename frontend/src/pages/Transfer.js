import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import config from '../config';

const Transfer = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: '',
    toAccountNumber: '',
    amount: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const activeAccounts = response.data.filter(acc => acc.status === 'active');
      setAccounts(activeAccounts);
      
      if (activeAccounts.length > 0) {
        setFormData(prev => ({ ...prev, fromAccountId: activeAccounts[0]._id }));
      }
    } catch (error) {
      console.error('Fetch accounts error:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromAccountId) {
      newErrors.fromAccountId = 'Please select a source account';
    }

    if (!formData.toAccountNumber) {
      newErrors.toAccountNumber = 'Please enter destination account number';
    } else if (formData.toAccountNumber.length < 10) {
      newErrors.toAccountNumber = 'Account number must be at least 10 characters';
    }

    if (!formData.amount) {
      newErrors.amount = 'Please enter amount';
    } else {
      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      } else {
        const selectedAccount = accounts.find(a => a._id === formData.fromAccountId);
        if (selectedAccount && amountNum > selectedAccount.balance) {
          newErrors.amount = `Insufficient balance. Available: $${selectedAccount.balance}`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const amountNum = parseFloat(formData.amount);
      
      const response = await axios.post(
        'http://localhost:5000/api/transactions/transfer',
        {
          fromAccountId: formData.fromAccountId,
          toAccountNumber: formData.toAccountNumber.trim(),
          amount: amountNum,
          description: formData.description.trim() || 'Funds transfer'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        
        // Reset form
        setFormData({
          fromAccountId: accounts[0]?._id || '',
          toAccountNumber: '',
          amount: '',
          description: ''
        });
        
        // Navigate to transactions page to see the transfer
        setTimeout(() => {
          navigate('/transactions');
        }, 1500);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Transfer failed. Please try again');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAccount = accounts.find(a => a._id === formData.fromAccountId);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center">
          <h5>No Active Accounts</h5>
          <p>You need an active account to make transfers.</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => navigate('/accounts')}
          >
            Open an Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Transfer Funds</h4>
            </div>
            
            <div className="card-body">
              {selectedAccount && (
                <div className="alert alert-secondary mb-4">
                  <div className="d-flex justify-content-between">
                    <span>Available Balance:</span>
                    <strong>${selectedAccount.balance.toLocaleString()} {selectedAccount.currency}</strong>
                  </div>
                  <div className="small text-muted mt-1">
                    Account: {selectedAccount.accountNumber}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">From Account</label>
                  <select
                    name="fromAccountId"
                    className={`form-select ${errors.fromAccountId ? 'is-invalid' : ''}`}
                    value={formData.fromAccountId}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Select account</option>
                    {accounts.map(account => (
                      <option key={account._id} value={account._id}>
                        {account.accountType} - {account.accountNumber} (${account.balance.toLocaleString()})
                      </option>
                    ))}
                  </select>
                  {errors.fromAccountId && (
                    <div className="invalid-feedback">{errors.fromAccountId}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">To Account Number</label>
                  <input
                    type="text"
                    name="toAccountNumber"
                    className={`form-control ${errors.toAccountNumber ? 'is-invalid' : ''}`}
                    value={formData.toAccountNumber}
                    onChange={handleChange}
                    disabled={submitting}
                    placeholder="Enter destination account number"
                  />
                  {errors.toAccountNumber && (
                    <div className="invalid-feedback">{errors.toAccountNumber}</div>
                  )}
                  <small className="text-muted">
                    Enter the account number you want to transfer to
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Amount (USD)</label>
                  <input
                    type="number"
                    name="amount"
                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                    value={formData.amount}
                    onChange={handleChange}
                    disabled={submitting}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <div className="invalid-feedback d-block">{errors.amount}</div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Description (Optional)</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={submitting}
                    rows="2"
                    placeholder="Add a reference or note"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    'Transfer Funds'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Make sure to export the component as default
export default Transfer;