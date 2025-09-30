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

import AccountSummary from "./AccountSummary";
import TransactionForm from "./TransactionForm";
import ControlDateConfig from "./ControlDateConfig";
import Filters from "./Filters";
import TransactionList from "./TransactionList";
import Calendar from "./Calendar";
import TransactionsByTypeGraph from "./TransactionsByTypeGraph";

// Color palettes
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // palette values for light mode
          primary: { main: '#1976d2' },
          secondary: { main: '#9c27b0' },
          background: {
            default: '#f5f5f5',
            paper: '#fff',
          },
          text: {
            primary: '#222',
            secondary: '#555',
          },
        }
      : {
          // palette values for dark mode using provided CSS variable colors
          primary: { main: '#76c370' }, // var(--clr-primary-a0)
          secondary: { main: '#47d5a6' }, // var(--clr-success-a10)
          background: {
            default: '#121212', // var(--clr-surface-a0)
            paper: '#282828',   // var(--clr-surface-a10)
          },
          text: {
            primary: '#ffffff', // var(--clr-light-a0)
            secondary: '#b5deaf', // var(--clr-primary-a40)
          },
          success: { main: '#22946e' }, // var(--clr-success-a0)
          warning: { main: '#a87a2a' }, // var(--clr-warning-a0)
          error: { main: '#9c2121' },   // var(--clr-danger-a0)
          info: { main: '#21498a' },    // var(--clr-info-a0)
        }),
  },
});

// Generate a color for each category (theme-aware)
function getCategoryColors(categories, mode) {
  // Use a set of visually distinct colors
  const lightColors = [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
    '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
    '#bcbd22', '#17becf', '#aec7e8', '#ffbb78',
    '#98df8a', '#ff9896', '#c5b0d5', '#c49c94',
    '#f7b6d2', '#c7c7c7', '#dbdb8d', '#9edae5',
    '#393b79', '#637939', '#8c6d31', '#843c39'
  ];

  const darkColors = [
    '#79b4f9', '#ffb87f', '#64c264', '#ff6e6e',
    '#c3a3e8', '#b08c7a', '#f4aad7', '#bfbfbf',
    '#e0e07f', '#55d6e0', '#c5ddf9', '#ffcfa3',
    '#b8e1b0', '#ffa3a3', '#d6c1e8', '#d1b8ad',
    '#f7c4e0', '#e0e0e0', '#f0f0a3', '#a3e0e8',
    '#7f7fbf', '#8ca37f', '#b5986d', '#bf7c78'
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
        <Box style={{ padding: "2rem", position: 'relative', minHeight: '100vh', zIndex: 1 }} data-theme={themeMode}>
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
