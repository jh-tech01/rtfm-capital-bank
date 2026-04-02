import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [accountsRes, transactionsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/accounts', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/transactions/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setAccounts(accountsRes.data);
      if (transactionsRes.data.success) {
        setRecentTransactions(transactionsRes.data.data.slice(0, 5));
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card bg-primary text-white mb-4">
            <div className="card-body">
              <h2>{t('auth.welcome_back', { name: user?.name })}</h2>
              <p className="lead mb-0">{t('dashboard.financial_summary')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">{t('dashboard.total_balance')}</h5>
              <h2 className="text-primary">${totalBalance.toLocaleString()}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">{t('dashboard.active_accounts')}</h5>
              <h2 className="text-primary">{accounts.length}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card shadow-sm h-100">
            <div className="card-body text-center">
              <h5 className="card-title">{t('dashboard.recent_transactions')}</h5>
              <h2 className="text-primary">{recentTransactions.length}</h2>
              <Link to="/transactions" className="btn btn-sm btn-outline-primary mt-2">
                {t('dashboard.view_all')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t('dashboard.recent_transactions')}</h5>
            </div>
            <div className="card-body">
              {recentTransactions.length === 0 ? (
                <p className="text-muted text-center">{t('transactions.no_transactions')}</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>{t('transactions.date')}</th>
                        <th>{t('transactions.description')}</th>
                        <th>{t('transactions.amount')}</th>
                       </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map(transaction => (
                        <tr key={transaction._id}>
                          <td>{formatDate(transaction.createdAt)}</td>
                          <td>{transaction.description}</td>
                          <td className={transaction.impact > 0 ? 'text-success' : 'text-danger'}>
                            {transaction.impact > 0 ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
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
        
        <div className="col-md-4">
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">{t('dashboard.quick_actions')}</h5>
            </div>
            <div className="card-body">
              <Link to="/transfer" className="btn btn-primary w-100 mb-2">
                {t('dashboard.transfer_money')}
              </Link>
              <Link to="/accounts" className="btn btn-outline-primary w-100">
                {t('dashboard.view_accounts')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;