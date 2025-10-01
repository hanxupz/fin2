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
import Register from "./components/Register";

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#a5d6a7' }, // pastel green
          secondary: { main: '#ce93d8' }, // pastel purple
          background: {
            default: '#fafafa',
            paper: '#ffffff',
          },
          text: {
            primary: '#333',
            secondary: '#666',
          },
          calendar: {
            weekdayBg: '#ffffff',
            weekdayText: '#6d9dc5',     // pastel blue
            weekendBg: '#fff0f5',       // light pastel pink
            weekendText: '#d081a3',     // dusty rose
            todayBg: '#e3f2fd',         // pale blue
            todayBorder: '#90caf9',     // pastel cyan-blue
            otherMonthBg: '#f5f5f5',
            otherMonthText: '#b0b0b0',  // soft gray
            amountNegative: '#ef9a9a',  // pastel red
            amountPositive: '#81c784',  // pastel green
          },
        }
      : {
          primary: { main: '#80cbc4' }, // pastel teal
          secondary: { main: '#f48fb1' }, // pastel pink
          background: {
            default: '#1c1c1c',
            paper: '#2a2a2a',
          },
          text: {
            primary: '#f5f5f5',
            secondary: '#cfcfcf',
          },
          success: { main: '#aed581' },
          warning: { main: '#ffcc80' },
          error: { main: '#e57373' },
          info: { main: '#64b5f6' },
          calendar: {
            weekdayBg: '#2a2a2a',
            weekdayText: '#9fa8da',     // pastel indigo
            weekendBg: '#3a2a3a',       // muted plum
            weekendText: '#f48fb1',     // pastel pink
            todayBg: '#283593',         // deep muted indigo
            todayBorder: '#7986cb',     // pastel lavender-blue
            otherMonthBg: '#333333',
            otherMonthText: '#9e9e9e',  // soft gray
            amountNegative: '#ef9a9a',  // pastel red
            amountPositive: '#a5d6a7',  // pastel green
          },
        }),
  },
});

// Generate a color for each category (theme-aware)
function getCategoryColors(categories, mode) {
  // Pastel palettes
  const lightColors = [
    '#aed581', '#81d4fa', '#ffcc80', '#ce93d8',
    '#80cbc4', '#f48fb1', '#d1c4e9', '#c5e1a5',
    '#b39ddb', '#ffab91', '#ffe082', '#9fa8da',
    '#b2dfdb', '#f8bbd0', '#cfd8dc', '#e6ee9c',
  ];

  const darkColors = [
    '#8bc34a', '#4dd0e1', '#ffb74d', '#ba68c8',
    '#4db6ac', '#f06292', '#9575cd', '#aed581',
    '#7986cb', '#ff8a65', '#ffd54f', '#64b5f6',
    '#80cbc4', '#e57373', '#90a4ae', '#dce775',
  ];

  const palette = mode === 'dark' ? darkColors : lightColors;
  const colorMap = {};
  categories.forEach((cat, idx) => {
    colorMap[cat] = palette[idx % palette.length];
  });
  return colorMap;
}

// Helper to format data for ControlDateAccountBarChart
function getControlDateAccountBarData(transactions) {
  // Group by control_date, then sum by account
  const grouped = {};
  transactions.forEach(t => {
    if (!t.control_date || !t.account || !t.amount) return;
    if (!grouped[t.control_date]) grouped[t.control_date] = {};
    grouped[t.control_date][t.account] = (grouped[t.control_date][t.account] || 0) + t.amount;
  });
  // Convert to array format for recharts
  return Object.entries(grouped).map(([control_date, accounts]) => ({
    control_date,
    ...accounts
  }));
}

// Token validation helper function
const isTokenValid = (token) => {
  if (!token) return false;
  
  try {
    // Decode JWT payload (basic validation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Invalid token format:', error);
    return false;
  }
};

// ------------------ Main App ------------------
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [showRegister, setShowRegister] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [controlDate, setControlDate] = useState(null);
  const [category, setCategory] = useState("Comida");
  const [account, setAccount] = useState("Corrente");
  const [editingId, setEditingId] = useState(null);

  const [filterCategory, setFilterCategory] = useState("");
  const [filterAccount, setFilterAccount] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(null);
  const [filterDateTo, setFilterDateTo] = useState(null);

  const [configYear, setConfigYear] = useState("");
  const [configMonth, setConfigMonth] = useState("");
  const [configControlDate, setConfigControlDate] = useState("");

  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [controlDateDialogOpen, setControlDateDialogOpen] = useState(false);

  const [themeMode, setThemeMode] = useState('dark');
  const theme = React.useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);
  
  // Mobile detection
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://192.168.1.97:8000";

  useEffect(() => {
    // Validate token on app load
    if (token) {
      if (isTokenValid(token)) {
        fetchTransactions();
        fetchControlDateConfig();
      } else {
        // Token is invalid or expired, logout
        console.log('Token is invalid or expired, logging out...');
        handleLogout();
      }
    }
  }, [token]);

  const fetchControlDateConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/config/control_date/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        // Token is invalid/expired, logout user
        handleLogout();
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        const dt = data.control_date ? new Date(data.control_date) : null;
        setConfigYear(dt ? dt.getFullYear() : "");
        setConfigMonth(dt ? dt.getMonth() : ""); // zero-based month
        setConfigControlDate(data.control_date);
        setControlDate(dt);
        setFilterDateFrom(dt);
      }
    } catch (err) {
      console.error("Failed to fetch control date config:", err);
    }
  };

  const updateControlDateConfig = async () => {
    try {
      const payload = { year: parseInt(configYear), month: parseInt(configMonth) + 1 };
      const res = await fetch(`${BACKEND_URL}/config/control_date/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setConfigControlDate(data.control_date);
        setControlDate(new Date(data.control_date));
        setFilterDateFrom(new Date(data.control_date));
        alert(`Control date updated to ${data.control_date}`);
        setControlDateDialogOpen(false);
      }
    } catch (err) {
      console.error("Failed to update control date config:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/transactions/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        // Token is invalid/expired, logout user
        handleLogout();
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    }
  };

  const addOrUpdateTransaction = async () => {
    if (!description || !amount) return;
    const payload = {
      description,
      amount: parseFloat(amount),
      date: date ? date.toISOString().split("T")[0] : null,
      control_date: controlDate ? controlDate.toISOString().split("T")[0] : null,
      category,
      account,
    };
    try {
      if (editingId) {
        await fetch(`${BACKEND_URL}/transactions/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        setEditingId(null);
      } else {
        await fetch(`${BACKEND_URL}/transactions/`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }
      setDescription("");
      setAmount("");
      setDate(null);
      setCategory("Comida");
      setAccount("Corrente");
      fetchTransactions();
      setTransactionDialogOpen(false);
    } catch (err) {
      console.error("Failed to add/update transaction:", err);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/transactions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  const editTransaction = (t) => {
    setEditingId(t.id);
    setDescription(t.description);
    setAmount(t.amount);
    setDate(t.date ? new Date(t.date) : null);
    setControlDate(t.control_date ? new Date(t.control_date) : null);
    setCategory(t.category || "Comida");
    setAccount(t.account || "Corrente");
    setTransactionDialogOpen(true);
  };

  const categories = [
    "Comida", "Carro", "Tabaco", "Ajuste", "Salário", "Futebol",
    "Cartão Crédito", "Telemóvel", "Jogo", "Transferência", "Saúde",
    "Desktop", "Subscrições", "Tabaco Extra", "Noite",
    "Jogos PC/Switch/Play", "Cerveja", "Roupa", "Poupança", "Casa",
    "Shareworks", "Educação", "Outro", "Férias"
  ];

  const accounts = [
    "Corrente", "Poupança Física", "Poupança Objectivo", "Shareworks", "Etoro",
    "Cartão Refeição", "Nexo", "Crédito", "Dívida", "Investimento"
  ];

  // Generate category color map for current theme
  const categoryColors = React.useMemo(() => getCategoryColors(categories, themeMode), [categories, themeMode]);

  const filteredTransactions = (transactions || []).filter((t) => {
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
    return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo;
  });

  // Inject calendar palette colors as CSS variables for Calendar.css
  const calendarVars = theme.palette.calendar;
  const calendarCssVars = {
    '--calendar-weekday-bg': calendarVars.weekdayBg,
    '--calendar-weekday-text': calendarVars.weekdayText,
    '--calendar-weekend-bg': calendarVars.weekendBg,
    '--calendar-weekend-text': calendarVars.weekendText,
    '--calendar-today-bg': calendarVars.todayBg,
    '--calendar-today-border': calendarVars.todayBorder,
    '--calendar-other-month-bg': calendarVars.otherMonthBg,
    '--calendar-other-month-text': calendarVars.otherMonthText,
  };

  // Auth logic
  const handleLogin = (jwt) => {
    setToken(jwt);
    localStorage.setItem('token', jwt);
  };
  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('token');
  };

  if (!token) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box style={{ padding: "2rem", minHeight: '100vh' }}>
          {showRegister ? (
            <Register onRegister={() => setShowRegister(false)} />
          ) : (
            <Login onLogin={handleLogin} />
          )}
          <button onClick={() => setShowRegister(s => !s)} style={{marginTop:20}}>
            {showRegister ? 'Back to Login' : 'Register' }
          </button>
        </Box>
      </ThemeProvider>
    );
  }

  // Mobile FAB positioning
  const fabStyle = {
    position: "fixed",
    zIndex: 1000,
    ...(isMobile ? {
      // Mobile: Stack vertically on the right
      right: 16,
    } : {
      // Desktop: Original positioning
      right: 30,
    })
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Animated background for current theme */}
      {themeMode === 'dark' ? (
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
        }} data-theme={themeMode}>
          <button 
            onClick={handleLogout} 
            style={{
              position:'absolute',
              top: isMobile ? 10 : 10,
              right: isMobile ? 10 : 10,
              zIndex:2000,
              padding: isMobile ? '8px 12px' : '10px 15px',
              fontSize: isMobile ? '0.8rem' : '1rem'
            }}
          >
            Logout
          </button>
          
          <Container maxWidth="xl" disableGutters={isMobile}>
            {isMobile ? (
              // Mobile Layout: Single column, stacked vertically
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant={isMobile ? "h5" : "h4"} gutterBottom align="center">
                    💰 My Account Summary
                  </Typography>
                </Grid>
                
                {controlDate && (
                  <>
                    <Grid item xs={12}>
                      <AccountSummary transactions={transactions} controlDate={controlDate} />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Calendar
                        transactions={filteredTransactions}
                        year={controlDate.getFullYear()}
                        month={controlDate.getMonth()}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
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
                        categories={categories}
                        accounts={accounts}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TransactionList
                        filteredTransactions={filteredTransactions}
                        editTransaction={editTransaction}
                        deleteTransaction={deleteTransaction}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TransactionsByTypeGraph
                        transactions={transactions.filter(t => t.control_date === controlDate.toISOString().split("T")[0])}
                        categoryColors={categoryColors}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TransactionsByTypeGraphAll
                        transactions={transactions.filter(t => t.control_date === controlDate.toISOString().split("T")[0])}
                        categoryColors={categoryColors}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <AccountSumChart transactions={transactions} controlDate={controlDate} />
                    </Grid>
                    
                    <Grid item xs={12} style={{ marginBottom: '100px' }}>
                      <ControlDateAccountBarChart data={getControlDateAccountBarData(transactions)} />
                    </Grid>
                  </>
                )}
              </Grid>
            ) : (
              // Desktop Layout: Original two-column layout
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Grid container direction="column" spacing={3}>
                    <Grid item>
                      <Typography variant="h4" gutterBottom align="center">
                        💰 My Account Summary
                      </Typography>
                    </Grid>
                    {controlDate && (
                      <>
                        <Grid item>
                          <AccountSummary transactions={transactions} controlDate={controlDate} />
                        </Grid>
                        <Grid item>
                          <Calendar
                            transactions={filteredTransactions}
                            year={controlDate.getFullYear()}
                            month={controlDate.getMonth()}
                          />
                        </Grid>
                        <Grid item>
                          <TransactionsByTypeGraph
                            transactions={transactions.filter(t => t.control_date === controlDate.toISOString().split("T")[0])}
                            categoryColors={categoryColors}
                          />
                        </Grid>
                        <Grid item>
                          <TransactionsByTypeGraphAll
                            transactions={transactions.filter(t => t.control_date === controlDate.toISOString().split("T")[0])}
                            categoryColors={categoryColors}
                          />
                        </Grid>
                        <Grid item>
                          <AccountSumChart transactions={transactions} controlDate={controlDate} />
                        </Grid>
                        <Grid item>
                          <ControlDateAccountBarChart data={getControlDateAccountBarData(transactions)} />
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
                        categories={categories}
                        accounts={accounts}
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
            
            {/* Floating Action Buttons */}
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setTransactionDialogOpen(true)}
              style={{
                ...fabStyle,
                bottom: isMobile ? 20 : 90,
              }}
            >
              <AddIcon />
            </Fab>
            
            <Fab
              color="secondary"
              aria-label="settings"
              onClick={() => setControlDateDialogOpen(true)}
              style={{
                ...fabStyle,
                bottom: isMobile ? 80 : 30,
              }}
            >
              <SettingsIcon />
            </Fab>
            
            <Fab
              color="default"
              aria-label="toggle theme"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              style={{
                ...fabStyle,
                bottom: isMobile ? 140 : 150,
              }}
            >
              {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </Fab>
            
            {/* Dialogs */}
            <Dialog 
              open={transactionDialogOpen} 
              onClose={() => setTransactionDialogOpen(false)} 
              maxWidth="sm" 
              fullWidth
              fullScreen={isMobile}
            >
              <DialogTitle>{editingId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
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
                  addOrUpdateTransaction={addOrUpdateTransaction}
                  editingId={editingId}
                  categories={categories}
                  accounts={accounts}
                />
              </DialogContent>
            </Dialog>
            
            <Dialog 
              open={controlDateDialogOpen} 
              onClose={() => setControlDateDialogOpen(false)} 
              maxWidth="sm" 
              fullWidth
              fullScreen={isMobile}
            >
              <DialogTitle>Update Control Date</DialogTitle>
              <DialogContent>
                <ControlDateConfig
                  configYear={configYear}
                  setConfigYear={setConfigYear}
                  configMonth={configMonth}
                  setConfigMonth={setConfigMonth}
                  configControlDate={configControlDate}
                  updateControlDateConfig={updateControlDateConfig}
                />
              </DialogContent>
            </Dialog>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;