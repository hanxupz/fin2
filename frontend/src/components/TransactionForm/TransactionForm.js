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
  FormControl,
  Stack
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { surfaceBoxSx } from "../../theme/primitives";

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
    <Paper elevation={2} sx={(t) => ({ ...surfaceBoxSx(t), p: 3 })}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {editingId ? 'Edit Transaction' : 'Add / Edit Transaction'}
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Description"
            value={description}
          onChange={(e) => setDescription(e.target.value)}
          size="small"
        />
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          size="small"
        />
        <DatePicker
          label="Date"
          value={date}
          onChange={setDate}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
        />
        <DatePicker
          label="Control Date"
          value={controlDate}
          onChange={setControlDate}
          slotProps={{ textField: { fullWidth: true, size: 'small' } }}
        />
        <FormControl fullWidth size="small">
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small">
          <InputLabel>Account</InputLabel>
          <Select label="Account" value={account} onChange={(e) => setAccount(e.target.value)}>
            {accounts.map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={addOrUpdateTransaction}
        >
          {editingId ? "Update" : "Add"} Transaction
        </Button>
      </Stack>
    </Paper>
  );
}

export default TransactionForm;
