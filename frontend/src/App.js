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

  // Load config on mount
  useEffect(() => {
    if (token) {
      fetchControlDateConfig();
    }
  }, [token]);

  // Filter transactions
  const filteredTransactions = (transactions || []).filter((t) => {
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
    const matchesControlDate = configControlDate ? t.control_date === configControlDate : true;
    return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo && matchesControlDate;
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
      {/* Animated background */}
      {appState.theme === 'dark' ? (
        <div className="animated-bg-dark" aria-hidden="true" />
      ) : (
        <div className="animated-bg-light" aria-hidden="true" />
      )}
      
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box style={{ 
          padding: isMobile ? "1rem" : "2rem", 
          position: 'relative', 
          minHeight: '100vh', 
          zIndex: 1, 
          ...calendarCssVars 
        }} data-theme={appState.theme}>
          
          {/* Logout button */}
          <button 
            onClick={handleLogout} 
            style={{
              position:'absolute',
              top: isMobile ? 10 : 10,
              right: isMobile ? 10 : 10,
              zIndex:2000,
              padding: isMobile ? '8px 12px' : '10px 15px',
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.background.paper,
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: isMobile ? '0.8rem' : '1rem'
            }}
          >
            Logout
          </button>
          
          <Container maxWidth="xl" disableGutters={isMobile}>
            {isMobile ? (
              // Mobile Layout
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom align="center">
                    💰 My Account Summary
                  </Typography>
                </Grid>
                
                {configControlDate && (
                  <>
                    <Grid item xs={12}>
                      <AccountSummary transactions={transactions} controlDate={new Date(configControlDate)} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Calendar
                        transactions={filteredTransactions}
                        year={new Date(configControlDate).getFullYear()}
                        month={new Date(configControlDate).getMonth()}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TransactionsByTypeGraph
                        transactions={filteredTransactions}
                        categoryColors={categoryColors}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TransactionsByTypeGraphAll
                        transactions={filteredTransactions}
                        categoryColors={categoryColors}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <AccountSumChart 
                        transactions={filteredTransactions} 
                        controlDate={configControlDate ? new Date(configControlDate) : null} 
                      />
                    </Grid>
                  </>
                )}
                
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    💰 My Transactions
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
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
                </Grid>
                
                <Grid item xs={12}>
                  <TransactionList
                    filteredTransactions={filteredTransactions}
                    editTransaction={editTransaction}
                    deleteTransaction={deleteTransaction}
                  />
                </Grid>
              </Grid>
            ) : (
              // Desktop Layout
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Grid container direction="column" spacing={3}>
                    <Grid item>
                      <Typography variant="h4" gutterBottom>
                        💰 My Account Summary
                      </Typography>
                    </Grid>
                    
                    {configControlDate && (
                      <>
                        <Grid item>
                          <AccountSummary transactions={transactions} controlDate={new Date(configControlDate)} />
                        </Grid>
                        
                        <Grid item>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Calendar
                                transactions={filteredTransactions}
                                year={new Date(configControlDate).getFullYear()}
                                month={new Date(configControlDate).getMonth()}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <TransactionsByTypeGraph
                                transactions={filteredTransactions}
                                categoryColors={categoryColors}
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        
                        <Grid item>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <TransactionsByTypeGraphAll
                                transactions={filteredTransactions}
                                categoryColors={categoryColors}
                              />
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <AccountSumChart 
                                transactions={filteredTransactions} 
                                controlDate={configControlDate ? new Date(configControlDate) : null} 
                              />
                            </Grid>
                          </Grid>
                        </Grid>
                        
                        <Grid item>
                          <Typography variant="h5" gutterBottom>
                            Control Date Account Overview
                          </Typography>
                          <ControlDateAccountBarChart data={getControlDateAccountBarData(filteredTransactions)} />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Grid container direction="column" spacing={3}>
                    <Grid item>
                      <Typography variant="h4" gutterBottom>
                        💰 My Transactions
                      </Typography>
                    </Grid>
                    
                    <Grid item>
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
                    </Grid>
                    
                    <Grid item>
                      <TransactionList
                        filteredTransactions={filteredTransactions}
                        editTransaction={editTransaction}
                        deleteTransaction={deleteTransaction}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Container>

          {/* Floating Action Buttons */}
          <Fab
            color="primary"
            onClick={() => setTransactionDialogOpen(true)}
            style={{ ...fabStyle, bottom: isMobile ? 90 : 90 }}
          >
            <AddIcon />
          </Fab>

          <Fab
            color="secondary"
            onClick={() => setControlDateDialogOpen(true)}
            style={{ ...fabStyle, bottom: isMobile ? 150 : 150 }}
          >
            <SettingsIcon />
          </Fab>

          <Fab
            onClick={() => appActions.setTheme(appState.theme === 'dark' ? 'light' : 'dark')}
            style={{ 
              ...fabStyle, 
              bottom: isMobile ? 210 : 210,
              backgroundColor: appState.theme === 'dark' ? '#ffeb3b' : '#424242',
              color: appState.theme === 'dark' ? '#000' : '#fff'
            }}
          >
            {appState.theme === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </Fab>

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
        </Box>
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