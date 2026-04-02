const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');

// Transfer funds between accounts (without MongoDB transactions)
router.post('/transfer', auth, async (req, res) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = req.body;

    // Validate required fields
    if (!fromAccountId || !toAccountNumber || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields' 
      });
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Amount must be a positive number' 
      });
    }

    // Find source account
    const sourceAccount = await Account.findOne({ 
      _id: fromAccountId,
      user: req.user.id
    });

    if (!sourceAccount) {
      return res.status(404).json({ 
        success: false,
        message: 'Source account not found' 
      });
    }

    // Check if account is active
    if (sourceAccount.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Source account is not active' 
      });
    }

    // Check balance
    if (sourceAccount.balance < transferAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Insufficient funds',
        balance: sourceAccount.balance
      });
    }

    // Find destination account
    const destinationAccount = await Account.findOne({ 
      accountNumber: toAccountNumber 
    });

    if (!destinationAccount) {
      return res.status(404).json({ 
        success: false,
        message: 'Destination account not found' 
      });
    }

    // Check if destination is active
    if (destinationAccount.status !== 'active') {
      return res.status(400).json({ 
        success: false,
        message: 'Destination account is not active' 
      });
    }

    // Prevent self transfer
    if (sourceAccount._id.toString() === destinationAccount._id.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot transfer to the same account' 
      });
    }

    // Perform atomic update - this is safe without transactions
    // First update source account (debit)
    const updatedSource = await Account.findOneAndUpdate(
      { 
        _id: sourceAccount._id, 
        balance: { $gte: transferAmount } // Ensure balance hasn't changed
      },
      { $inc: { balance: -transferAmount } },
      { new: true }
    );

    if (!updatedSource) {
      return res.status(400).json({ 
        success: false,
        message: 'Transfer failed: Balance changed during transaction' 
      });
    }

    // Then update destination account (credit)
    const updatedDest = await Account.findOneAndUpdate(
      { _id: destinationAccount._id },
      { $inc: { balance: transferAmount } },
      { new: true }
    );

    if (!updatedDest) {
      // Rollback source account if destination update fails
      await Account.findOneAndUpdate(
        { _id: sourceAccount._id },
        { $inc: { balance: transferAmount } }
      );
      return res.status(500).json({ 
        success: false,
        message: 'Transfer failed: Could not credit destination account' 
      });
    }

    // Create transaction record
    const transaction = new Transaction({
      fromAccount: sourceAccount._id,
      toAccount: destinationAccount._id,
      amount: transferAmount,
      type: 'transfer',
      description: description || `Transfer to ${destinationAccount.accountNumber}`,
      status: 'completed',
      createdAt: new Date()
    });

    await transaction.save();

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Transfer completed successfully',
      transaction: {
        id: transaction._id,
        fromAccount: {
          id: updatedSource._id,
          number: updatedSource.accountNumber,
          type: updatedSource.accountType,
          balance: updatedSource.balance
        },
        toAccount: {
          id: updatedDest._id,
          number: updatedDest.accountNumber,
          type: updatedDest.accountType,
          balance: updatedDest.balance
        },
        amount: transferAmount,
        description: transaction.description,
        date: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Transfer failed: ' + error.message
    });
  }
});

// Deposit money
router.post('/deposit', auth, async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ message: 'Account ID and amount are required' });
    }

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id,
      status: 'active'
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or is inactive' });
    }

    // Update balance
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: accountId },
      { $inc: { balance: depositAmount } },
      { new: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      fromAccount: account._id,
      toAccount: account._id,
      amount: depositAmount,
      type: 'deposit',
      description: description || 'Cash deposit',
      status: 'completed'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Deposit successful',
      newBalance: updatedAccount.balance,
      transaction
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Deposit failed: ' + error.message });
  }
});

// Withdraw money
router.post('/withdraw', auth, async (req, res) => {
  try {
    const { accountId, amount, description } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ message: 'Account ID and amount are required' });
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const account = await Account.findOne({
      _id: accountId,
      user: req.user.id,
      status: 'active'
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found or is inactive' });
    }

    if (account.balance < withdrawAmount) {
      return res.status(400).json({ 
        message: 'Insufficient balance',
        currentBalance: account.balance
      });
    }

    // Update balance
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: accountId, balance: { $gte: withdrawAmount } },
      { $inc: { balance: -withdrawAmount } },
      { new: true }
    );

    if (!updatedAccount) {
      return res.status(400).json({ message: 'Withdrawal failed: Balance changed' });
    }

    // Create transaction record
    const transaction = new Transaction({
      fromAccount: account._id,
      toAccount: account._id,
      amount: withdrawAmount,
      type: 'withdrawal',
      description: description || 'Cash withdrawal',
      status: 'completed'
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal successful',
      newBalance: updatedAccount.balance,
      transaction
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Withdrawal failed: ' + error.message });
  }
});

// Get all transactions for user
router.get('/history', auth, async (req, res) => {
  try {
    // Get user's accounts
    const userAccounts = await Account.find({ user: req.user.id });
    const accountIds = userAccounts.map(acc => acc._id);

    // Find all transactions involving user's accounts
    const transactions = await Transaction.find({
      $or: [
        { fromAccount: { $in: accountIds } },
        { toAccount: { $in: accountIds } }
      ]
    })
    .populate('fromAccount', 'accountNumber accountType')
    .populate('toAccount', 'accountNumber accountType')
    .sort({ createdAt: -1 });

    // Format transactions with user context
    const formattedTransactions = transactions.map(transaction => {
      const isSender = transaction.fromAccount && 
        userAccounts.some(acc => acc._id.toString() === transaction.fromAccount._id.toString());
      const isReceiver = transaction.toAccount && 
        userAccounts.some(acc => acc._id.toString() === transaction.toAccount._id.toString());

      return {
        _id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
        fromAccount: transaction.fromAccount,
        toAccount: transaction.toAccount,
        direction: isSender ? 'outgoing' : (isReceiver ? 'incoming' : 'unknown'),
        impact: isSender ? -transaction.amount : transaction.amount
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedTransactions
    });

  } catch (error) {
    console.error('History fetch error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transaction history: ' + error.message
    });
  }
});

// Get single transaction
router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('fromAccount', 'accountNumber accountType')
      .populate('toAccount', 'accountNumber accountType');

    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transaction not found' 
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Transaction fetch error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch transaction' 
    });
  }
});

module.exports = router;