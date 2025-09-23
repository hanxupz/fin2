import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
        setConfigMonth(dt ? String(dt.getMonth() + 1).padStart(2, "0") : "");
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
      const payload = { year: parseInt(configYear), month: parseInt(configMonth) };
      const res = await fetch(`${BACKEND_URL}/config/control_date/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setConfigControlDate(data.control_date);
        setControlDate(data.control_date);
        setFilterDateFrom(data.control_date);
        alert(`Control date updated to ${data.control_date}`);
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
      date: date ? date.toISOString().split('T')[0] : null,
      control_date: controlDate ? controlDate.toISOString().split('T')[0] : null,
      category,
      account
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
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesAccount = filterAccount ? t.account === filterAccount : true;
    const matchesDateFrom = filterDateFrom ? new Date(t.date) >= new Date(filterDateFrom) : true;
    const matchesDateTo = filterDateTo ? new Date(t.date) <= new Date(filterDateTo) : true;
    return matchesCategory && matchesAccount && matchesDateFrom && matchesDateTo;
  });

  const categories = ["Comida","Carro","Tabaco","Ajuste","Salário","Futebol","Cartão Crédito","Telemóvel","Jogo","Transferência","Saúde","Desktop","Subscrições","Tabaco Extra","Noite","Jogos PC/Switch/Play","Cerveja","Roupa","Poupança","Casa","Shareworks","Educação","Outro","Férias"];
  const accounts = ["Corrente","Poupança Física","Poupança Objectivo","Shareworks","Etoro","Cartão Refeição","Nexo","Crédito","Dívida","Investimento"];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" style={{ padding: "2rem 0" }}>
        <Grid container spacing={3}>
          {/* Left Panel */}
          <Grid item xs={12} md={4}>
            <Paper style={{ padding: "1rem", marginBottom: "2rem" }}>
              <Typography variant="h6" gutterBottom>
                Add / Edit Transaction
              </Typography>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                margin="normal"
              />
              <DatePicker
                label="Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <DatePicker
                label="Control Date"
                value={controlDate}
                onChange={(newValue) => setControlDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Account</InputLabel>
                <Select value={account} onChange={(e) => setAccount(e.target.value)}>
                  {accounts.map((a) => (
                    <MenuItem key={a} value={a}>{a}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                style={{ marginTop: "1rem" }}
                onClick={addOrUpdateTransaction}
              >
                {editingId ? "Update" : "Add"} Transaction
              </Button>
            </Paper>

            <Paper style={{ padding: "1rem" }}>
              <Typography variant="h6" gutterBottom>
                Control Date Configuration
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="Year"
                value={configYear}
                onChange={(e) => setConfigYear(e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                type="number"
                label="Month"
                value={configMonth}
                onChange={(e) => setConfigMonth(e.target.value)}
                margin="normal"
              />
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                style={{ marginTop: "1rem" }}
                onClick={updateControlDateConfig}
              >
                Save Control Date
              </Button>
              {configControlDate && (
                <Typography style={{ marginTop: "1rem" }}>
                  Current Control Date: {configControlDate}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Right Panel */}
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              💰 My Transactions
            </Typography>

            <Paper style={{ padding: "1rem", marginBottom: "1rem" }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Account</InputLabel>
                <Select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                >
                  <MenuItem value="">All Accounts</MenuItem>
                  {accounts.map((a) => (
                    <MenuItem key={a} value={a}>{a}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="From Date"
                value={filterDateFrom}
                onChange={(newValue) => setFilterDateFrom(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <DatePicker
                label="To Date"
                value={filterDateTo}
                onChange={(newValue) => setFilterDateTo(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
              <Button
                variant="outlined"
                fullWidth
                style={{ marginTop: "1rem" }}
                onClick={() => {
                  setFilterCategory("");
                  setFilterAccount("");
                  setFilterDateFrom(null);
                  setFilterDateTo(null);
                }}
              >
                Reset Filters
              </Button>
            </Paper>

            {filteredTransactions.length === 0 ? (
              <Typography>No transactions found.</Typography>
            ) : (
              filteredTransactions.map((t) => (
                <Card key={t.id} style={{ marginBottom: "1rem" }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {t.description} {t.amount.toFixed(2)}€
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Date: {t.date || "-"} | Category: {t.category || "-"} | Account: {t.account || "-"}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => editTransaction(t)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => deleteTransaction(t.id)}>Delete</Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
}

export default App;
