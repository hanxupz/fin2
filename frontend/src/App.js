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
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import AccountSummary from "./AccountSummary";
import TransactionForm from "./TransactionForm";
import ControlDateConfig from "./ControlDateConfig";
import Filters from "./Filters";
import TransactionList from "./TransactionList";

// ------------------ Calendar Component ------------------
const Calendar = ({ transactions, year, month }) => {
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getStartDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getStartDayOfMonth(year, month);

  // Map transactions by day
  const transactionMap = {};
  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (date.getMonth() === month && date.getFullYear() === year) {
      if (!transactionMap[date.getDate()]) transactionMap[date.getDate()] = [];
      transactionMap[date.getDate()].push(t.amount);
    }
  });

  const calendarDays = [];

  for (let i = 0; i < startDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const amounts = transactionMap[day] || [];
    calendarDays.push(
      <div key={day} className="calendar-day">
        <div className="day-number">{day.toString().padStart(2, "0")}</div>
        {amounts.map((amt, idx) => (
          <div key={idx} className={`amount ${amt < 0 ? "negative" : "positive"}`}>
            {amt.toFixed(2)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">{calendarDays}</div>
    </div>
  );
};

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

  const filteredTransactions = transactions.filter((t) => {
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
    return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo;
  });

  return (
    <CssBaseline>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box style={{ backgroundColor: "antiquewhite", padding: "2rem", position: 'relative' }}>
          <Container maxWidth="lg">
            <Grid container spacing={3}>
              {/* Left Panel */}
              <Grid item xs={12} md={8}>
                <Typography variant="h4" gutterBottom align="center">
                  💰 My Account Summary
                </Typography>
                {controlDate && (
                  <>
                    <AccountSummary transactions={transactions} controlDate={controlDate} />
                    <Typography variant="h6" gutterBottom style={{ marginTop: "2rem" }}>
                      📅 Transactions Calendar
                    </Typography>
                    <Calendar
                      transactions={filteredTransactions}
                      year={controlDate.getFullYear()}
                      month={controlDate.getMonth()}
                    />
                  </>
                )}
              </Grid>

              {/* Right Panel */}
              <Grid item xs={12} md={4}>
                <Typography variant="h4" gutterBottom>
                  💰 My Transactions
                </Typography>

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

                <TransactionList
                  filteredTransactions={filteredTransactions}
                  editTransaction={editTransaction}
                  deleteTransaction={deleteTransaction}
                />
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
    </CssBaseline>
  );
}

export default App;
