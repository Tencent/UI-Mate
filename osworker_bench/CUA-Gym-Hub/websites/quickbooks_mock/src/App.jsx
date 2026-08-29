import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { StoreProvider } from './lib/store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import CreateInvoice from './pages/CreateInvoice';
import Expenses from './pages/Expenses';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Go from './pages/Go';
import Payroll from './pages/Payroll';
import Projects from './pages/Projects';
import Budgets from './pages/Budgets';
import Taxes from './pages/Taxes';
import Accounting from './pages/Accounting';

function RedirectWithQuery({ to }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();
  return <Navigate to={query ? `${to}?${query}` : to} replace />;
}

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* /go without layout for API-like access */}
          <Route path="/go" element={<Go />} />

          {/* All other routes with Layout */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />

                {/* Transactions / Banking */}
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/transactions/rules" element={<Transactions initialView="rules" />} />
                <Route path="/transactions/receipts" element={<Transactions initialView="receipts" />} />

                {/* Sales */}
                <Route path="/sales" element={<Sales initialTab="all-sales" />} />
                <Route path="/sales/invoices" element={<Sales initialTab="invoices" />} />
                <Route path="/sales/customers" element={<Sales initialTab="customers" />} />
                <Route path="/sales/products" element={<Sales initialTab="products" />} />
                <Route path="/sales/new-invoice" element={<CreateInvoice />} />

                {/* Expenses */}
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/expenses/bills" element={<Expenses initialTab="bills" />} />
                <Route path="/expenses/vendors" element={<Expenses initialTab="vendors" />} />

                {/* Customers */}
                <Route path="/customers" element={<Sales initialTab="customers" />} />

                {/* Reports */}
                <Route path="/reports" element={<Reports />} />
                <Route path="/reports/:reportId" element={<Reports />} />

                {/* Payroll */}
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/payroll/employees" element={<Payroll initialTab="employees" />} />
                <Route path="/payroll/contractors" element={<Payroll initialTab="contractors" />} />

                {/* Projects */}
                <Route path="/projects" element={<Projects />} />

                {/* Budgets */}
                <Route path="/budgets" element={<Budgets />} />

                {/* Taxes */}
                <Route path="/taxes" element={<Taxes />} />

                {/* Accounting */}
                <Route path="/accounting" element={<Accounting />} />
                <Route path="/accounting/reconcile" element={<Accounting initialTab="reconcile" />} />

                {/* My Accountant */}
                <Route path="/accountant" element={<Accounting initialTab="accountant" />} />

                {/* Catch-all */}
                <Route path="*" element={<RedirectWithQuery to="/" />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App;

