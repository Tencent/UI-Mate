import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { initializeData, getInitialState, fetchCustomState, getSessionId, saveState, calculateStateDiff } from './initialData';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const sidRef = useRef(getSessionId());
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const sid = sidRef.current;

    if (sid) {
      const sessionKey = `qb_mock_initial_${sid}`;
      const isRefresh = localStorage.getItem(sessionKey) !== null;

      if (isRefresh) {
        const loaded = initializeData(sid);
        setData(loaded);
        setLoading(false);
      } else {
        fetchCustomState(sid).then(customState => {
          const loaded = initializeData(sid, customState);
          setData(loaded);
          setLoading(false);
        });
      }
    } else {
      const loaded = initializeData();
      setData(loaded);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (data && !loading) {
      saveState(data, sidRef.current);
    }
  }, [data, loading]);

  // --- Invoice mutations ---
  const addInvoice = (invoice) => {
    setData(prev => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
  };

  const updateInvoice = (updatedInvoice) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv)
    }));
  };

  const deleteInvoice = (invoiceId) => {
    setData(prev => ({
      ...prev,
      invoices: prev.invoices.filter(inv => inv.id !== invoiceId)
    }));
  };

  // --- Customer mutations ---
  const addCustomer = (customer) => {
    setData(prev => ({ ...prev, customers: [...prev.customers, customer] }));
  };

  const updateCustomer = (updatedCustomer) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    }));
  };

  const deleteCustomer = (customerId) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== customerId)
    }));
  };

  // --- Vendor mutations ---
  const addVendor = (vendor) => {
    setData(prev => ({ ...prev, vendors: [...prev.vendors, vendor] }));
  };

  const updateVendor = (updatedVendor) => {
    setData(prev => ({
      ...prev,
      vendors: prev.vendors.map(v => v.id === updatedVendor.id ? updatedVendor : v)
    }));
  };

  const deleteVendor = (vendorId) => {
    setData(prev => ({
      ...prev,
      vendors: prev.vendors.filter(v => v.id !== vendorId)
    }));
  };

  // --- Product mutations ---
  const addProduct = (product) => {
    setData(prev => ({ ...prev, products: [...prev.products, product] }));
  };

  const updateProduct = (updatedProduct) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    }));
  };

  const deleteProduct = (productId) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  // --- Expense mutations ---
  const addExpense = (expense) => {
    setData(prev => ({ ...prev, expenses: [expense, ...prev.expenses] }));
  };

  const updateExpense = (updatedExpense) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === updatedExpense.id ? updatedExpense : e)
    }));
  };

  const deleteExpense = (expenseId) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== expenseId)
    }));
  };

  // --- Bill mutations ---
  const addBill = (bill) => {
    setData(prev => ({ ...prev, bills: [...prev.bills, bill] }));
  };

  const updateBill = (updatedBill) => {
    setData(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === updatedBill.id ? updatedBill : b)
    }));
  };

  // --- Estimate mutations ---
  const addEstimate = (estimate) => {
    setData(prev => ({ ...prev, estimates: [...prev.estimates, estimate] }));
  };

  const updateEstimate = (updatedEstimate) => {
    setData(prev => ({
      ...prev,
      estimates: prev.estimates.map(e => e.id === updatedEstimate.id ? updatedEstimate : e)
    }));
  };

  // --- Transaction mutations ---
  const addTransaction = (transaction) => {
    setData(prev => ({ ...prev, transactions: [transaction, ...prev.transactions] }));
  };

  const updateTransaction = (updatedTransaction) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx => tx.id === updatedTransaction.id ? updatedTransaction : tx)
    }));
  };

  const categorizeTransaction = (txId, category) => {
    setData(prev => ({
      ...prev,
      transactions: prev.transactions.map(tx =>
        tx.id === txId ? { ...tx, category, status: 'posted' } : tx
      )
    }));
  };

  // --- Account mutations ---
  const addAccount = (account) => {
    setData(prev => ({ ...prev, accounts: [...prev.accounts, account] }));
  };

  const updateAccount = (updatedAccount) => {
    setData(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a)
    }));
  };

  // --- Report mutations ---
  const toggleReportStar = (reportId) => {
    setData(prev => ({
      ...prev,
      reportCategories: prev.reportCategories.map(cat => ({
        ...cat,
        reports: cat.reports.map(r => r.id === reportId ? { ...r, starred: !r.starred } : r)
      }))
    }));
  };

  // --- Local outbound drafts ---
  const addEmailDraft = (draft) => {
    setData(prev => ({
      ...prev,
      emailDrafts: [draft, ...(prev.emailDrafts || [])]
    }));
  };

  // --- Debug ---
  const getDebugState = () => {
    const initial = getInitialState(sidRef.current);
    const initialState = initial || data;
    const diff = calculateStateDiff(initialState, data);

    return {
      initial_state: initialState,
      current_state: data,
      state_diff: diff
    };
  };

  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '"Avenir Next", "Helvetica Neue", Helvetica, Arial, sans-serif' }}>Loading...</div>;
  }

  return (
    <StoreContext.Provider value={{
      data,
      // Invoice
      addInvoice, updateInvoice, deleteInvoice,
      // Customer
      addCustomer, updateCustomer, deleteCustomer,
      // Vendor
      addVendor, updateVendor, deleteVendor,
      // Product
      addProduct, updateProduct, deleteProduct,
      // Expense
      addExpense, updateExpense, deleteExpense,
      // Bill
      addBill, updateBill,
      // Estimate
      addEstimate, updateEstimate,
      // Transaction
      addTransaction, updateTransaction, categorizeTransaction,
      // Account
      addAccount, updateAccount,
      // Report
      toggleReportStar,
      // Local drafts
      addEmailDraft,
      // Debug
      getDebugState,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
