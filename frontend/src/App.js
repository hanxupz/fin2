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
  DialogContent
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

// Color palettes
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: { main: '#00e676' }, // neon lime
          secondary: { main: '#d500f9' }, // neon purple
          background: {
            default: '#fafafa',
            paper: '#ffffff',
          },
          text: {
            primary: '#111',
            secondary: '#444',
          },
          calendar: {
            weekdayBg: '#fdfdfd',
            weekdayText: '#00c853',     // neon green
            weekendBg: '#fff7ff',
            weekendText: '#ff00cc',     // neon pink
            todayBg: '#e0f7fa',
            todayBorder: '#00e5ff',     // neon cyan
            otherMonthBg: '#f4f4f4',
            otherMonthText: '#ff6d00',  // neon orange
            amountNegative: '#ff1744',  // neon red
            amountPositive: '#39ff14',  // neon green
          },
        }
      : {
          primary: { main: '#39ff14' }, // neon green
          secondary: { main: '#00e5ff' }, // neon cyan
          background: {
            default: '#0d0d0d',
            paper: '#1a1a1a',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b0ffb0',
          },
          success: { main: '#00ffcc' },
          warning: { main: '#ffea00' },
          error: { main: '#ff073a' },
          info: { main: '#00bfff' },
          calendar: {
            weekdayBg: '#0d0d0d',
            weekdayText: '#39ff14',     // neon green
            weekendBg: '#1a0033',
            weekendText: '#ff00ff',     // neon magenta
            todayBg: '#001a33',
            todayBorder: '#00e5ff',     // neon cyan
            otherMonthBg: '#1c1c1c',
            otherMonthText: '#ffea00',  // neon yellow
            amountNegative: '#ff073a',  // neon red
            amountPositive: '#00ffcc',  // neon aqua
          },
        }),
  },
});

// Generate a color for each category (theme-aware)
function getCategoryColors(categories, mode) {
  // Vibrant neon palettes
  const lightColors = [
    '#00e676', '#ff1744', '#2979ff', '#ffea00',
    '#d500f9', '#00e5ff', '#ff6d00', '#00bfa5',
    '#ff4081', '#76ff03', '#651fff', '#f50057',
    '#64dd17', '#00b8d4', '#ff9100', '#c51162',
  ];

  const darkColors = [
    '#39ff14', '#ff073a', '#00bfff', '#ffea00',
    '#ff00ff', '#00ffcc', '#ff6ec7', '#76ff03',
    '#ff1493', '#00e5ff', '#ffd700', '#ff4500',
    '#7df9ff', '#adff2f', '#ff69b4', '#ff8c00',
  ];

  const palette = mode === 'dark' ? darkColors : lightColors;
  const colorMap = {};
  categories.forEach((cat, idx) => {
    colorMap[cat] = palette[idx % palette.length];
  });
  return colorMap;
}


// ------------------ Main App ------------------
function App() {
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

  const BACKEND_URL = "http://192.168.1.97:8000";

  useEffect(() => {
    fetchTransactions();
    fetchControlDateConfig();
  }, []);

  const fetchControlDateConfig = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/config/control_date/`);
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
      const payload = { year: parseInt(configYear), month: parseInt(configMonth) + 1 }; // API expects 1-based month
      const res = await fetch(`${BACKEND_URL}/config/control_date/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`${BACKEND_URL}/transactions/`);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setEditingId(null);
      } else {
        await fetch(`${BACKEND_URL}/transactions/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
      await fetch(`${BACKEND_URL}/transactions/${id}`, { method: "DELETE" });
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

  const filteredTransactions = transactions.filter((t) => {
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
        <Box style={{ padding: "2rem", position: 'relative', minHeight: '100vh', zIndex: 1, ...calendarCssVars }} data-theme={themeMode}>
          <Container maxWidth="lg">
            <Grid container spacing={2}>
              {/* Left Panel */}
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
                        {/* Expenses by Type Graph for current control date */}
                        <TransactionsByTypeGraph
                          transactions={transactions.filter(t => t.control_date === controlDate.toISOString().split("T")[0])}
                          categoryColors={categoryColors}
                        />
                      </Grid>
                    </>
                  )}
                </Grid>
              </Grid>

              {/* Right Panel */}
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

            {/* FABs */}
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setTransactionDialogOpen(true)}
              style={{
                position: "fixed",
                bottom: 90,
                right: 30,
                zIndex: 1000,
              }}
            >
              <AddIcon />
            </Fab>

            <Fab
              color="secondary"
              aria-label="settings"
              onClick={() => setControlDateDialogOpen(true)}
              style={{
                position: "fixed",
                bottom: 30,
                right: 30,
                zIndex: 1000,
              }}
            >
              <SettingsIcon />
            </Fab>

            {/* Theme Toggle FAB */}
            <Fab
              color="default"
              aria-label="toggle theme"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              style={{
                position: "fixed",
                bottom: 150,
                right: 30,
                zIndex: 1000,
              }}
            >
              {themeMode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
            </Fab>

            {/* Transaction Dialog */}
            <Dialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} maxWidth="sm" fullWidth>
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

            {/* Control Date Dialog */}
            <Dialog open={controlDateDialogOpen} onClose={() => setControlDateDialogOpen(false)} maxWidth="sm" fullWidth>
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
