import { Transaction, Wallet } from '../types';
import { users } from './users';

export const wallets: Wallet[] = [
  { userId: 'e1', balance: 25000, currency: 'USD' },
  { userId: 'e2', balance: 15000, currency: 'USD' },
  { userId: 'e3', balance: 8000, currency: 'USD' },
  { userId: 'e4', balance: 50000, currency: 'USD' },
  { userId: 'i1', balance: 250000, currency: 'USD' },
  { userId: 'i2', balance: 500000, currency: 'USD' },
  { userId: 'i3', balance: 180000, currency: 'USD' },
];

export const transactions: Transaction[] = [
  { id: 'tx1', type: 'deposit', amount: 50000, senderId: 'i1', receiverId: 'i1', description: 'Wallet top-up', status: 'completed', createdAt: '2024-03-01T10:00:00Z' },
  { id: 'tx2', type: 'transfer', amount: 10000, senderId: 'i1', receiverId: 'e1', description: 'Seed funding - TechWave AI', status: 'completed', createdAt: '2024-03-05T14:30:00Z' },
  { id: 'tx3', type: 'deposit', amount: 25000, senderId: 'e1', receiverId: 'e1', description: 'Deposit from bank', status: 'completed', createdAt: '2024-03-10T09:15:00Z' },
  { id: 'tx4', type: 'withdraw', amount: 5000, senderId: 'e1', receiverId: 'e1', description: 'Withdraw to bank account', status: 'completed', createdAt: '2024-03-12T11:00:00Z' },
  { id: 'tx5', type: 'transfer', amount: 25000, senderId: 'i2', receiverId: 'e2', description: 'Investment - GreenLife Solutions', status: 'pending', createdAt: '2024-03-15T16:45:00Z' },
  { id: 'tx6', type: 'deposit', amount: 100000, senderId: 'i3', receiverId: 'i3', description: 'Funds added', status: 'completed', createdAt: '2024-03-18T08:00:00Z' },
];

export const getWallet = (userId: string): Wallet => {
  return wallets.find(w => w.userId === userId) || { userId, balance: 0, currency: 'USD' };
};

export const getTransactionsForUser = (userId: string): Transaction[] => {
  return transactions.filter(t => t.senderId === userId || t.receiverId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
  const newTx: Transaction = {
    ...tx,
    id: `tx${transactions.length + 1}`,
    createdAt: new Date().toISOString(),
  };
  transactions.unshift(newTx);

  const senderWallet = wallets.find(w => w.userId === tx.senderId);
  const receiverWallet = wallets.find(w => w.userId === tx.receiverId);

  if (tx.status === 'completed') {
    if (tx.type === 'deposit' && receiverWallet) {
      receiverWallet.balance += tx.amount;
    } else if (tx.type === 'withdraw' && senderWallet) {
      senderWallet.balance -= tx.amount;
    } else if (tx.type === 'transfer') {
      if (senderWallet) senderWallet.balance -= tx.amount;
      if (receiverWallet) receiverWallet.balance += tx.amount;
    }
  }

  return newTx;
};

export const processFundingDeal = (investorId: string, entrepreneurId: string, amount: number): Transaction => {
  return addTransaction({
    type: 'transfer',
    amount,
    senderId: investorId,
    receiverId: entrepreneurId,
    description: `Funding deal - ${getUserDisplayName(entrepreneurId)}`,
    status: 'completed',
  });
};

export const getUserDisplayName = (userId: string): string => {
  const user = users.find(u => u.id === userId);
  return user ? user.name : 'Unknown';
};
