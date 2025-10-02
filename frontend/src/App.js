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
  useTheme as useMuiTheme,
  Paper
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { fabSx } from './theme/primitives';
import { sectionContainerSx } from './theme/primitives';

// Refactored imports
import { AppProvider, useAppContext } from './context/AppContext';
import { useAuth } from './hooks/useAuth';
import { useTransactions } from './hooks/useTransactions';
import { CATEGORIES, ACCOUNTS, DEFAULT_CATEGORY, DEFAULT_ACCOUNT } from './constants';
import { getControlDateAccountBarData } from './utils/charts';
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
import { Box as MuiBox } from '@mui/material';

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
  const categoryColors = React.useMemo(() => {
    const palette = theme.palette.charts.category;
    return CATEGORIES.reduce((acc, cat, idx) => ({ ...acc, [cat]: palette[idx % palette.length] }), {});
  }, [theme, appState.theme]);

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
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div className="App fade-in" data-theme={appState.theme} style={calendarCssVars}>
          <MuiBox component="main" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, pb: 6 }}>
            {/* Account Summary Section */}
            {configControlDate && (
              <Box component={Paper} elevation={3} sx={(t)=>({ ...sectionContainerSx(t), p:3, borderRadius:4 })}>
                <Typography variant="h5" fontWeight={600}>Account Overview</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5, mb: 2 }}>Your financial snapshot for the current control period</Typography>
                <AccountSummary transactions={transactions} controlDate={new Date(configControlDate)} />
              </Box>
            )}
            
            {/* Charts and Visualizations */}
            {configControlDate && (
              <Box component={Paper} elevation={3} sx={(t)=>({ ...sectionContainerSx(t), p:3, borderRadius:4 })}>
                <Typography variant="h5" fontWeight={600}>Financial Insights</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5, mb: 2 }}>Visual representation of your spending patterns and trends</Typography>
                <Box sx={{ mt: 4 }}>
                  <Calendar
                    transactions={filteredTransactions}
                    year={new Date(configControlDate).getFullYear()}
                    month={new Date(configControlDate).getMonth()}
                  />
                </Box>
                <Box sx={{ mt: 4 }}>
                  <TransactionsByTypeGraph
                    transactions={filteredTransactions}
                    categoryColors={categoryColors}
                  />
                </Box>
                <Box sx={{ display: 'grid', mt: 4, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  <TransactionsByTypeGraphAll
                    transactions={filteredTransactions}
                    categoryColors={categoryColors}
                  />
                  <AccountSumChart 
                    transactions={filteredTransactions} 
                    controlDate={configControlDate ? new Date(configControlDate) : null} 
                  />
                </Box>
                {getControlDateAccountBarData(allTransactionsFiltered) && (
                  <Box sx={{ mt: 4 }}>
                    <ControlDateAccountBarChart data={getControlDateAccountBarData(allTransactionsFiltered)} />
                  </Box>
                )}
              </Box>
            )}
            
            {/* Filters Section */}
            <Box component={Paper} elevation={3} sx={(t)=>({ ...sectionContainerSx(t), p:3, borderRadius:4 })}>
              <Typography variant="h5" fontWeight={600}>Refine Your View</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5, mb: 2 }}>Filter transactions by category, account, or date range to focus on what matters</Typography>
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
            </Box>
            
            {/* Transaction List Section */}
            <Box component={Paper} elevation={3} sx={(t)=>({ ...sectionContainerSx(t), p:3, borderRadius:4 })}>
              <Typography variant="h5" fontWeight={600}>Transaction History</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: -0.5, mb: 2 }}>Your complete financial story, transaction by transaction</Typography>
              <TransactionList
                filteredTransactions={filteredTransactions}
                editTransaction={editTransaction}
                deleteTransaction={deleteTransaction}
              />
            </Box>
            {/* Floating Action Buttons */}
            <Box sx={{ position: 'fixed', bottom: 24, right: 24, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Fab aria-label="add transaction" onClick={() => setTransactionDialogOpen(true)} sx={fabSx(theme)} size="medium">
                <AddIcon />
              </Fab>
              <Fab aria-label="configure control date" onClick={() => setControlDateDialogOpen(true)} sx={fabSx(theme)} size="medium">
                <SettingsIcon />
              </Fab>
              <Fab aria-label="toggle theme" onClick={handleToggleTheme} sx={fabSx(theme)} size="medium">
                {appState.theme === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
              </Fab>
              <Fab aria-label="logout" onClick={handleLogout} size="medium" sx={(t) => ({ ...fabSx(t), background: t.palette.gradients.danger })}>
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </Fab>
            </Box>
          </MuiBox>
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