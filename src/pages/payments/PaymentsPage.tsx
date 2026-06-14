import React, { useState, useEffect } from 'react';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft,
  RefreshCw, Plus, Minus, Send, Check, X, Clock, ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Transaction, TransactionType } from '../../types';
import {
  getWallet, getTransactionsForUser, addTransaction,
  processFundingDeal, getUserDisplayName
} from '../../data/payments';
import { users } from '../../data/users';

type ActionType = 'deposit' | 'withdraw' | 'transfer' | 'funding' | null;

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'error'; icon: React.ReactNode }> = {
  completed: { variant: 'success', icon: <Check size={14} /> },
  pending: { variant: 'warning', icon: <Clock size={14} /> },
  failed: { variant: 'error', icon: <X size={14} /> },
};

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0, currency: 'USD' });
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType>(null);
  const [amount, setAmount] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [description, setDescription] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const otherUsers = users.filter(u => u.id !== user?.id);

  useEffect(() => {
    if (!user) return;
    setWallet(getWallet(user.id));
    setTxns(getTransactionsForUser(user.id));
  }, [user]);

  if (!user) return null;

  const handleAction = () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;

    let tx: Transaction;

    switch (activeAction) {
      case 'deposit':
        tx = addTransaction({ type: 'deposit', amount: num, senderId: user.id, receiverId: user.id, description: description || 'Wallet deposit', status: 'completed' });
        break;
      case 'withdraw':
        if (num > wallet.balance) return;
        tx = addTransaction({ type: 'withdraw', amount: num, senderId: user.id, receiverId: user.id, description: description || 'Wallet withdrawal', status: 'completed' });
        break;
      case 'transfer':
        if (num > wallet.balance || !recipientId) return;
        tx = addTransaction({ type: 'transfer', amount: num, senderId: user.id, receiverId: recipientId, description: description || `Transfer to ${getUserDisplayName(recipientId)}`, status: 'completed' });
        break;
      case 'funding':
        if (num > wallet.balance || !recipientId) return;
        tx = processFundingDeal(user.id, recipientId, num);
        break;
      default:
        return;
    }

    setWallet(getWallet(user.id));
    setTxns(getTransactionsForUser(user.id));
    setSuccessMsg(activeAction === 'funding' ? 'Funding deal completed!' : `${activeAction} of $${num.toLocaleString()} successful!`);
    setActiveAction(null);
    setAmount('');
    setRecipientId('');
    setDescription('');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">Manage your wallet, transfer funds, and fund startups</p>
      </div>

      {successMsg && (
        <div className="bg-success-50 border border-success-200 text-success-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <Check size={18} />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Wallet size={24} />
                </div>
                <p className="text-sm font-medium text-white/80">Wallet Balance</p>
              </div>
              <p className="text-3xl font-bold mb-1">
                ${wallet.balance.toLocaleString()}
              </p>
              <p className="text-sm text-white/60">{wallet.currency} &middot; Available</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </CardHeader>
            <CardBody className="space-y-2">
              <Button fullWidth variant="success" leftIcon={<Plus size={16} />} onClick={() => setActiveAction('deposit')}>
                Deposit
              </Button>
              <Button fullWidth variant="warning" leftIcon={<Minus size={16} />} onClick={() => setActiveAction('withdraw')}>
                Withdraw
              </Button>
              <Button fullWidth variant="primary" leftIcon={<Send size={16} />} onClick={() => setActiveAction('transfer')}>
                Transfer
              </Button>
              {user.role === 'investor' && (
                <Button fullWidth variant="accent" leftIcon={<TrendingUp size={16} />} onClick={() => setActiveAction('funding')}>
                  Fund Startup
                </Button>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {activeAction && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 capitalize">
                  {activeAction === 'funding' ? 'Fund Startup' : activeAction}
                </h2>
                <Button size="xs" variant="ghost" onClick={() => setActiveAction(null)}>
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardBody className="space-y-4">
                {activeAction === 'transfer' || activeAction === 'funding' ? (
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    value={recipientId}
                    onChange={e => setRecipientId(e.target.value)}
                  >
                    <option value="">Select recipient...</option>
                    {otherUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                ) : null}

                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  startAdornment={<span className="text-gray-500 font-medium">$</span>}
                />

                <Input
                  placeholder="Description (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button onClick={handleAction} disabled={!amount || parseFloat(amount) <= 0 || ((activeAction === 'transfer' || activeAction === 'funding') && !recipientId)}>
                    {activeAction === 'funding' ? 'Confirm Funding' : `Confirm ${activeAction}`}
                  </Button>
                  <Button variant="outline" onClick={() => setActiveAction(null)}>Cancel</Button>
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
              <Badge variant="gray">{txns.length} total</Badge>
            </CardHeader>
            <CardBody>
              {txns.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-1">
                  <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>Type</span>
                    <span>Amount</span>
                    <span>Sender</span>
                    <span>Receiver</span>
                    <span>Status</span>
                  </div>
                  {txns.map(tx => {
                    const isSender = tx.senderId === user.id;
                    const otherId = isSender ? tx.receiverId : tx.senderId;
                    const otherName = tx.type === 'deposit' || tx.type === 'withdraw' ? 'You' : getUserDisplayName(otherId);
                    return (
                      <div key={tx.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 rounded-lg items-center">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-full ${tx.type === 'deposit' || (tx.type === 'transfer' && !isSender) ? 'bg-success-50' : 'bg-warning-50'}`}>
                            {tx.type === 'deposit' ? <ArrowDownLeft size={14} className="text-success-600" /> :
                             tx.type === 'withdraw' ? <ArrowUpRight size={14} className="text-warning-600" /> :
                             isSender ? <ArrowUpRight size={14} className="text-warning-600" /> : <ArrowDownLeft size={14} className="text-success-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{tx.type}</p>
                            <p className="text-xs text-gray-500">{tx.description.slice(0, 30)}</p>
                          </div>
                        </div>
                        <div className="md:text-center">
                          <span className={`text-sm font-semibold ${tx.type === 'deposit' || (tx.type === 'transfer' && !isSender) ? 'text-success-600' : 'text-warning-600'}`}>
                            {tx.type === 'deposit' || (tx.type === 'transfer' && !isSender) ? '+' : '-'}${tx.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {tx.type === 'deposit' ? '—' : isSender ? 'You' : getUserDisplayName(tx.senderId)}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {tx.type === 'withdraw' ? '—' : getUserDisplayName(tx.receiverId)}
                        </div>
                        <div>
                          <Badge variant={statusConfig[tx.status].variant} size="sm">
                            <span className="flex items-center gap-1">
                              {statusConfig[tx.status].icon}
                              {tx.status}
                            </span>
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
