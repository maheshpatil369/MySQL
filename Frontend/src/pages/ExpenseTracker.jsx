import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, List, TrendingUp, TrendingDown, DollarSign, Calendar as CalendarIcon, Tag, Link as LinkIcon, AlertCircle, CheckCircle, Edit2, Trash2, Filter as FilterIcon, Search as SearchIcon, Briefcase, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const API_EXPENSES_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/expenses`;
const API_TRIPS_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/trips`;

const ExpenseTracker = () => {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ total_credit: 0, total_debit: 0, balance: 0 });
  const [userTrips, setUserTrips] = useState([]);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('debit'); 
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [fetchDataError, setFetchDataError] = useState(null);

  const processResponse = async (response, itemName) => {
    if (!response.ok) {
      let errorMsg = `Failed to fetch ${itemName}: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.msg || errorData.error || errorMsg;
      } catch (jsonError) {
      }
      throw new Error(errorMsg);
    }
    return response.json();
  };

  const fetchExpensesData = async () => {
    if (!token) {
        setIsFetchingData(false);
        setFetchDataError("Not authenticated. Please log in.");
        return;
    }
    setIsFetchingData(true);
    setFetchDataError(null);
    try {
      const [transRes, summaryRes, tripsRes] = await Promise.all([
        fetch(`${API_EXPENSES_URL}/user`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_EXPENSES_URL}/user/summary`, { headers: { 'x-auth-token': token } }),
        fetch(API_TRIPS_URL, { headers: { 'x-auth-token': token } })
      ]);

      const transData = await processResponse(transRes, 'transactions');
      setTransactions(transData);

      const summaryData = await processResponse(summaryRes, 'summary');
      setSummary(summaryData);
      
      const tripsData = await processResponse(tripsRes, 'trips');
      setUserTrips(tripsData);

    } catch (err) {
      setFetchDataError(err.message || `An unknown error occurred while fetching expense data.`);
    } finally {
      setIsFetchingData(false);
    }
  };

  useEffect(() => {
    fetchExpensesData();
  }, [token]);

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!description.trim() || !amount || !type || !expenseDate) {
      setSubmitError("Description, amount, type, and date are required.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        setSubmitError("Amount must be a positive number.");
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    const transactionData = {
      description: description.trim(),
      amount: parsedAmount,
      type,
      expense_date: expenseDate.toISOString().split('T')[0],
      category: category.trim() || null,
      trip_id: selectedTripId || null,
    };

    try {
      const response = await fetch(API_EXPENSES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(transactionData),
      });
      const responseData = await response.json(); // Ensure response is parsed
      if (!response.ok) {
        throw new Error(responseData.msg || 'Failed to add transaction.');
      }
      setSubmitSuccess('Transaction added successfully!');
      setDescription('');
      setAmount('');
      setType('debit');
      setExpenseDate(new Date());
      setCategory('');
      setSelectedTripId('');
      fetchExpensesData(); 
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage your income and expenses efficiently.</p>
        </motion.div>

        {isFetchingData && (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-blue-600" />
            <p className="ml-3 text-base sm:text-lg">Loading expense data...</p>
          </div>
        )}

        {fetchDataError && !isFetchingData && (
           <div className="my-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>Error: {fetchDataError}</span>
          </div>
        )}

        {!isFetchingData && !fetchDataError && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="bg-green-500/10 dark:bg-green-500/20 p-4 sm:p-6 rounded-xl border border-green-500/30">
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Total Credited</p>
                    <p className="text-xl sm:text-2xl font-bold">₹{summary.total_credit?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-red-500/10 dark:bg-red-500/20 p-4 sm:p-6 rounded-xl border border-red-500/30">
                <div className="flex items-center text-red-600 dark:text-red-400">
                  <TrendingDown className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Total Debited</p>
                    <p className="text-xl sm:text-2xl font-bold">₹{summary.total_debit?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-blue-500/10 dark:bg-blue-500/20 p-4 sm:p-6 rounded-xl border border-blue-500/30">
                <div className="flex items-center text-blue-600 dark:text-blue-400">
                  <DollarSign className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium">Current Balance</p>
                    <p className="text-xl sm:text-2xl font-bold">₹{summary.balance?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Add Transaction Form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" /> Add New Transaction
              </h2>
              <form onSubmit={handleAddTransaction} className="space-y-4 flex flex-col md:items-end">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Ensure grid takes full width before button aligns */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <input type="text" id="description" value={description} onChange={(e) => setDescription(e.target.value)} required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                    <input type="number" id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} required step="0.01" min="0.01"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select id="type" value={type} onChange={(e) => setType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="debit">Debit (Expense)</option>
                      <option value="credit">Credit (Income)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="expenseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <DatePicker selected={expenseDate} onChange={(date) => setExpenseDate(date)} dateFormat="yyyy-MM-dd" required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category (Optional)</label>
                    <input type="text" id="category" value={category} onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g., Food, Travel, Salary"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label htmlFor="tripId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Trip (Optional)</label>
                    <select id="tripId" value={selectedTripId} onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option value="">None</option>
                      {userTrips.map(trip => (
                        <option key={trip.id} value={trip.id}>
                          {(trip.start_city || 'N/A').substring(0,15)} to {(trip.end_city || 'N/A').substring(0,15)} ({formatDate(trip.start_date)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {submitError && <p className="text-sm text-red-600 flex items-center"><AlertCircle className="h-4 w-4 mr-1" />{submitError}</p>}
                {submitSuccess && <p className="text-sm text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1" />{submitSuccess}</p>}
                <button type="submit" disabled={isSubmitting}
                  className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center mt-2 md:mt-0"> {/* Added mt-2 for mobile spacing from last input row, md:mt-0 to reset */}
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <PlusCircle className="h-5 w-5 mr-2" />}
                  {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </form>
            </motion.div>

            {/* Transactions List */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <List className="h-5 w-5 sm:h-6 sm:w-6 mr-2 text-blue-600" /> Transaction History
              </h2>
              {transactions.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No transactions yet. Add one above to get started!</p>
              )}
              {transactions.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Date</th>
                        <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Description</th>
                        <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Category</th>
                        <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300">Trip</th>
                        <th scope="col" className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-300">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map((tx) => {
                        const linkedTrip = userTrips.find(t => t.id === tx.trip_id);
                        return (
                          <tr key={tx.id} className={`${tx.type === 'credit' ? 'bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'}`}>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-700 dark:text-gray-300">{formatDate(tx.expense_date)}</td>
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words">{tx.description}</td> {/* Allow break-words */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words">{tx.category || '-'}</td> {/* Allow break-words */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                              {linkedTrip ? `${(linkedTrip.start_city || 'N/A').substring(0,10)}...` : '-'}
                            </td>
                            <td className={`px-2 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-right font-semibold ${tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                              {tx.type === 'credit' ? '+' : '-'} {parseFloat(tx.amount).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ExpenseTracker;
