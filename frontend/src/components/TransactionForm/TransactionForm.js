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
import { DEFAULT_CATEGORY, DEFAULT_ACCOUNT } from "../../constants";

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
  accounts,
  configControlDate
}) {
  const theme = useTheme();

  React.useEffect(() => {
    if (!editingId && !controlDate && configControlDate) {
      setControlDate(new Date(configControlDate));
    }
  }, [editingId, configControlDate, setControlDate]);

  // Handle amount adjustments
  const handleAmountAdjustment = (adjustment) => {
    const currentAmount = parseFloat(amount) || 0;
    const newAmount = currentAmount + adjustment;
    setAmount(newAmount.toFixed(2)); // Allow negative values and format to 2 decimals
  };

  // Reset all form values to defaults
  const handleReset = () => {
    setDescription("");
    setAmount("");
    setDate(null);
    setControlDate(configControlDate ? new Date(configControlDate) : null);
    setCategory(DEFAULT_CATEGORY);
    setAccount(DEFAULT_ACCOUNT);
  };

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
        {/* Amount Adjustment Buttons */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, pointerEvents: 'auto' }}>
          {/* Positive adjustments */}
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(0.01)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': { 
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main'
              }
            }}
          >
            +0.01
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(0.10)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': { 
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main'
              }
            }}
          >
            +0.10
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(1)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': { 
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main'
              }
            }}
          >
            +1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(10)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'success.main',
              color: 'success.main',
              '&:hover': { 
                backgroundColor: 'success.main',
                color: 'white',
                borderColor: 'success.main'
              }
            }}
          >
            +10
          </Button>
          
          {/* Negative adjustments */}
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(-10)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': { 
                backgroundColor: 'error.main',
                color: 'white',
                borderColor: 'error.main'
              }
            }}
          >
            -10
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(-1)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': { 
                backgroundColor: 'error.main',
                color: 'white',
                borderColor: 'error.main'
              }
            }}
          >
            -1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(-0.10)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': { 
                backgroundColor: 'error.main',
                color: 'white',
                borderColor: 'error.main'
              }
            }}
          >
            -0.10
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleAmountAdjustment(-0.01)}
            sx={{ 
              minWidth: 'auto', 
              px: 1, 
              pointerEvents: 'auto',
              borderColor: 'error.main',
              color: 'error.main',
              '&:hover': { 
                backgroundColor: 'error.main',
                color: 'white',
                borderColor: 'error.main'
              }
            }}
          >
            -0.01
          </Button>
        </Stack>
        
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          size="small"
        />
        {/* Date Shortcut Buttons */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - 2);
              setDate(targetDate);
            }}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            Yesterday - 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - 1);
              setDate(targetDate);
            }}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            Yesterday
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              const targetDate = new Date();
              setDate(targetDate);
            }}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            Today
          </Button>
        </Stack>
        
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
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={addOrUpdateTransaction}
            sx={{ flex: 1 }}
          >
            {editingId ? "Update" : "Add"} Transaction
          </Button>
          <Button
            variant="outlined"
            onClick={handleReset}
            color="secondary"
          >
            Reset
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default TransactionForm;
