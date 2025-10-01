import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function TransactionForm({
  description, setDescription,
  amount, setAmount,
  date, setDate,
  controlDate, setControlDate,
  category, setCategory,
  account, setAccount,
  addOrUpdateTransaction,
  editingId,
  categories,
  accounts
}) {
  const theme = useTheme();

  return (
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
        onChange={setDate}
        slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
      />

      <DatePicker
        label="Control Date"
        value={controlDate}
        onChange={setControlDate}
        slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Category</InputLabel>
        <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Account</InputLabel>
        <Select label="Account" value={account} onChange={(e) => setAccount(e.target.value)}>
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
  );
}

export default TransactionForm;
