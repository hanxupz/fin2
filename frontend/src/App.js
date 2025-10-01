import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Box,
  CssBaseline,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  useTheme as useMuiTheme
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';

// Refactored imports
import { AppProvider, useAppContext } from './context/AppContext';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { CATEGORIES, ACCOUNTS, DEFAULT_CATEGORY, DEFAULT_ACCOUNT } from './constants';
import { getCategoryColors, getControlDateAccountBarData } from './utils/charts';
import { getDesignTokens } from './utils/theme';
import apiService from './services/api';

// Component imports
import AccountSummary from "./components/AccountSummary/AccountSummary";
import TransactionForm from "./components/TransactionForm/TransactionForm";
import ControlDateConfig from "./components/ControlDateConfig/ControlDateConfig";
import Filters from "./components/Filters/Filters";
import TransactionList from "./components/TransactionList/TransactionList";
import Calendar from "./components/Calendar/Calendar";
import TransactionsByTypeGraph from "./components/TransactionsByTypeGraph/TransactionsByTypeGraph";
import TransactionsByTypeGraphAll from "./components/TransactionsByTypeGraphAll/TransactionsByTypeGraphAll";
import AccountSumChart from "./components/AccountSumChart/AccountSumChart";
import ControlDateAccountBarChart from "./components/ControlDateAccountBarChart/ControlDateAccountBarChart";
import Login from "./components/Login";

const AppContent = () => {
  const { state: appState, actions: appActions } = useAppContext();
  const { token, isAuthenticated, login, logout } = useAuth();
  const { transactions, createTransaction, updateTransaction, deleteTransaction } = useTransactions(token);

  // Local state
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [controlDate, setControlDate] = useState(null);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [account, setAccount] = useState(DEFAULT_ACCOUNT);
  const [editingId, setEditingId] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);

  // Config
  const [configYear, setConfigYear] = useState("");
  const [configMonth, setConfigMonth] = useState("");
  const [configControlDate, setConfigControlDate] = useState("");

  // Dialog states
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [controlDateDialogOpen, setControlDateDialogOpen] = useState(false);

  // Theme and responsive
  const theme = React.useMemo(() => createTheme(getDesignTokens(appState.theme)), [appState.theme]);
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Fetch control date config
  const fetchControlDateConfig = async () => {
    try {
      const data = await apiService.getControlDate(token);
      setConfigYear(data.year.toString());
      setConfigMonth(data.month.toString());
      setConfigControlDate(data.control_date);
    } catch (err) {
      console.error("Failed to fetch control date config:", err);
    }
  };

  // Submit transaction
  const submitTransaction = async () => {
    try {
      const transactionData = {
        description,
        amount: parseFloat(amount),
        date: date ? date.toISOString().split('T')[0] : null,
        control_date: controlDate ? controlDate.toISOString().split('T')[0] : null,
        category,
        account
      };

      if (editingId) {
        await updateTransaction(editingId, transactionData);
        setEditingId(null);
      } else {
        await createTransaction(transactionData);
      }

      // Reset form
      setDescription("");
      setAmount("");
      setDate(null);
      setControlDate(null);
      setCategory(DEFAULT_CATEGORY);
      setAccount(DEFAULT_ACCOUNT);
      setTransactionDialogOpen(false);
    } catch (err) {
      console.error("Failed to submit transaction:", err);
    }
  };

  // Submit control date config
  const submitControlDateConfig = async () => {
    try {
      const config = {
        year: parseInt(configYear),
        month: parseInt(configMonth),
        control_date: configControlDate
      };
      
      await apiService.setControlDate(config, token);
      setControlDateDialogOpen(false);
      fetchControlDateConfig();
    } catch (err) {
      console.error("Failed to set control date:", err);
    }
  };

  // Edit transaction
  const editTransaction = (t) => {
    setEditingId(t.id);
    setDescription(t.description);
    setAmount(t.amount);
    setDate(t.date ? new Date(t.date) : null);
    setControlDate(t.control_date ? new Date(t.control_date) : null);
    setCategory(t.category || DEFAULT_CATEGORY);
    setAccount(t.account || DEFAULT_ACCOUNT);
    setTransactionDialogOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle theme toggle
  const handleToggleTheme = () => {
    appActions.setTheme(appState.theme === 'dark' ? 'light' : 'dark');
  };

  // Load config on mount
  useEffect(() => {
    if (token) {
      fetchControlDateConfig();
    }
  }, [token]);

  // Filter transactions (includes control_date filtering for most components)
  const filteredTransactions = (transactions || []).filter((t) => {
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
    const matchesControlDate = configControlDate ? t.control_date === configControlDate : true;
    return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo && matchesControlDate;
  });

  // Filter transactions for ControlDateAccountBarChart (no control_date filtering - needs all historical data)
  const allTransactionsFiltered = (transactions || []).filter((t) => {
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
    return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo;
  });

  // Generate category colors for current theme
  const categoryColors = React.useMemo(() => 
    getCategoryColors(CATEGORIES, appState.theme), [appState.theme]
  );

  // CSS variables for calendar
  const calendarCssVars = {
    '--calendar-weekday-bg': theme.palette.calendar.weekdayBg,
    '--calendar-weekday-text': theme.palette.calendar.weekdayText,
    '--calendar-day-bg': theme.palette.calendar.dayBg,
    '--calendar-day-text': theme.palette.calendar.dayText,
    '--calendar-today-bg': theme.palette.calendar.todayBg,
    '--calendar-today-text': theme.palette.calendar.todayText,
    '--calendar-transaction-bg': theme.palette.calendar.transactionBg,
    '--calendar-transaction-text': theme.palette.calendar.transactionText,
  };

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // FAB positioning
  const fabStyle = {
    position: "fixed",
    zIndex: 1000,
    ...(isMobile ? {
      right: 16,
    } : {
      right: 30,
    })
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Modern background */}
      <div className="app-background" aria-hidden="true" />
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="App fade-in" data-theme={appState.theme} style={calendarCssVars}>
          {/* Header */}
          <header className="app-header">
            <h1 className="app-title">Financial Poetry</h1>
            <p className="app-subtitle">
              Transform your financial data into meaningful insights through elegant visualization and intuitive design.
            </p>
          </header>
          
          <main className="main-content">
            
            {/* Workflow Steps - Pixel Poetry inspired */}
            <div className="workflow-steps">
              <div className="workflow-step">
                <div className="step-number">1</div>
                <h3 className="step-title">Track Your Story</h3>
                <p className="step-description">
                  Record your financial transactions and discover the narrative within your spending patterns.
                </p>
              </div>
              <div className="workflow-step">
                <div className="step-number">2</div>
                <h3 className="step-title">Visualize Your Journey</h3>
                <p className="step-description">
                  Transform raw data into beautiful insights through charts, calendars, and summaries.
                </p>
              </div>
              <div className="workflow-step">
                <div className="step-number">3</div>
                <h3 className="step-title">Shape Your Future</h3>
                <p className="step-description">
                  Use elegant analysis to make informed decisions and craft your financial poetry.
                </p>
              </div>
            </div>
            
            {/* Account Summary Section */}
            {configControlDate && (
              <section className="content-section">
                <h2 className="section-title">Account Overview</h2>
                <p className="section-subtitle">Your financial snapshot for the current control period</p>
                <AccountSummary transactions={transactions} controlDate={new Date(configControlDate)} />
              </section>
            )}
            
            {/* Charts and Visualizations */}
            {configControlDate && (
              <section className="content-section">
                <h2 className="section-title">Financial Insights</h2>
                <p className="section-subtitle">Visual representation of your spending patterns and trends</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                  <Calendar
                    transactions={filteredTransactions}
                    year={new Date(configControlDate).getFullYear()}
                    month={new Date(configControlDate).getMonth()}
                  />
                  <TransactionsByTypeGraph
                    transactions={filteredTransactions}
                    categoryColors={categoryColors}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  <TransactionsByTypeGraphAll
                    transactions={filteredTransactions}
                    categoryColors={categoryColors}
                  />
                  <AccountSumChart 
                    transactions={filteredTransactions} 
                    controlDate={configControlDate ? new Date(configControlDate) : null} 
                  />
                </div>
                
                {getControlDateAccountBarData(allTransactionsFiltered) && (
                  <div style={{ marginTop: '2rem' }}>
                    <ControlDateAccountBarChart data={getControlDateAccountBarData(allTransactionsFiltered)} />
                  </div>
                )}
              </section>
            )}
            
            {/* Filters Section */}
            <section className="content-section">
              <h2 className="section-title">Refine Your View</h2>
              <p className="section-subtitle">Filter transactions by category, account, or date range to focus on what matters</p>
              <Filters
                filterCategory={filterCategory}
                setFilterCategory={setFilterCategory}
                filterAccount={filterAccount}
                setFilterAccount={setFilterAccount}
                filterDateFrom={filterDateFrom}
                setFilterDateFrom={setFilterDateFrom}
                filterDateTo={filterDateTo}
                setFilterDateTo={setFilterDateTo}
                categories={CATEGORIES}
                accounts={ACCOUNTS}
              />
            </section>
            
            {/* Transaction List Section */}
            <section className="content-section">
              <h2 className="section-title">Transaction History</h2>
              <p className="section-subtitle">Your complete financial story, transaction by transaction</p>
              <TransactionList
                filteredTransactions={filteredTransactions}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
              />
            </section>

          {/* Transaction Dialog */}
          <Dialog 
            open={transactionDialogOpen} 
            onClose={() => setTransactionDialogOpen(false)}
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>
              {editingId ? "Edit Transaction" : "Add New Transaction"}
            </DialogTitle>
            <DialogContent>
              <TransactionForm
                description={description}
                setDescription={setDescription}
                amount={amount}
                setAmount={setAmount}
                date={date}
                setDate={setDate}
                controlDate={controlDate}
                setControlDate={setControlDate}
                category={category}
                setCategory={setCategory}
                account={account}
                setAccount={setAccount}
                categories={CATEGORIES}
                accounts={ACCOUNTS}
                onSubmit={submitTransaction}
                onCancel={() => {
                  setTransactionDialogOpen(false);
                  setEditingId(null);
                }}
                editingId={editingId}
              />
            </DialogContent>
          </Dialog>

          {/* Control Date Config Dialog */}
          <Dialog 
            open={controlDateDialogOpen} 
            onClose={() => setControlDateDialogOpen(false)}
            maxWidth="sm" 
            fullWidth
          >
            <DialogTitle>Configure Control Date</DialogTitle>
            <DialogContent>
              <ControlDateConfig
                configYear={configYear}
                setConfigYear={setConfigYear}
                configMonth={configMonth}
                setConfigMonth={setConfigMonth}
                configControlDate={configControlDate}
                setConfigControlDate={setConfigControlDate}
                onSubmit={submitControlDateConfig}
                onCancel={() => setControlDateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          {/* Floating Action Buttons */}
          <div className="fab-container">
            <button
              className="custom-fab"
              onClick={() => setTransactionDialogOpen(true)}
              title="Add Transaction"
            >
              <AddIcon />
            </button>
            <button
              className="custom-fab"
              onClick={() => setControlDateDialogOpen(true)}
              title="Configure Date"
            >
              <SettingsIcon />
            </button>
            <button
              className="custom-fab"
              onClick={handleToggleTheme}
              title="Toggle Theme"
            >
              {appState.theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </button>
            <button
              className="custom-fab"
              onClick={handleLogout}
              title="Logout"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>
          </div>
          
          </main>
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;