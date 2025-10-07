import React, { useCallback, useMemo, useState, useEffect } from "react";
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

// Memoized button styles to avoid recreation on every render
const POSITIVE_BUTTON_SX = {
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
};

const NEGATIVE_BUTTON_SX = {
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
};

const DATE_BUTTON_SX = {
  minWidth: 'auto',
  px: 2
};

const TransactionForm = React.memo(({
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
}) => {
  const theme = useTheme();

  // Local state for debounced inputs
  const [localDescription, setLocalDescription] = useState(description);
  const [localAmount, setLocalAmount] = useState(amount);

  React.useEffect(() => {
    if (!editingId && !controlDate && configControlDate) {
      setControlDate(new Date(configControlDate));
    }
  }, [editingId, configControlDate, setControlDate]);

  // Sync local state with props
  useEffect(() => {
    setLocalDescription(description);
  }, [description]);

  useEffect(() => {
    setLocalAmount(amount);
  }, [amount]);

  // Debounce description updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDescription !== description) {
        setDescription(localDescription);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localDescription, description, setDescription]);

  // Debounce amount updates
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localAmount !== amount) {
        setAmount(localAmount);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localAmount, amount, setAmount]);

  // Memoized paper styles
  const paperStyles = useMemo(() => ({
    ...surfaceBoxSx(theme),
    p: 3
  }), [theme]);

  // Handle amount adjustments with useCallback
  const handleAmountAdjustment = useCallback((adjustment) => {
    const currentAmount = parseFloat(localAmount) || 0;
    const newAmount = currentAmount + adjustment;
    const formattedAmount = newAmount.toFixed(2);
    setLocalAmount(formattedAmount);
    // Immediately update parent for amount adjustments (no debounce needed)
    setAmount(formattedAmount);
  }, [localAmount, setAmount]);

  // Reset all form values to defaults with useCallback
  const handleReset = useCallback(() => {
    setDescription("");
    setAmount("");
    setLocalDescription("");
    setLocalAmount("");
    setDate(null);
    setControlDate(configControlDate ? new Date(configControlDate) : null);
    setCategory(DEFAULT_CATEGORY);
    setAccount(DEFAULT_ACCOUNT);
  }, [setDescription, setAmount, setDate, setControlDate, setCategory, setAccount, configControlDate]);

  // Memoized date handlers
  const handleYesterdayMinus1 = useCallback(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 2);
    setDate(targetDate);
  }, [setDate]);

  const handleYesterday = useCallback(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - 1);
    setDate(targetDate);
  }, [setDate]);

  const handleToday = useCallback(() => {
    const targetDate = new Date();
    setDate(targetDate);
  }, [setDate]);

  // Memoized amount adjustment handlers
  const amountAdjustmentHandlers = useMemo(() => ({
    plus001: () => handleAmountAdjustment(0.01),
    plus010: () => handleAmountAdjustment(0.10),
    plus1: () => handleAmountAdjustment(1),
    plus10: () => handleAmountAdjustment(10),
    minus10: () => handleAmountAdjustment(-10),
    minus1: () => handleAmountAdjustment(-1),
    minus010: () => handleAmountAdjustment(-0.10),
    minus001: () => handleAmountAdjustment(-0.01)
  }), [handleAmountAdjustment]);

  return (
    <Paper elevation={2} sx={paperStyles}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {editingId ? 'Edit Transaction' : 'Add / Edit Transaction'}
      </Typography>
      <Stack spacing={2}>
        <TextField
          fullWidth
          label="Description"
          value={localDescription}
          onChange={(e) => setLocalDescription(e.target.value)}
          size="small"
        />
        {/* Amount Adjustment Buttons */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, pointerEvents: 'auto' }}>
          {/* Positive adjustments */}
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.plus001}
            sx={POSITIVE_BUTTON_SX}
          >
            +.01
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.plus010}
            sx={POSITIVE_BUTTON_SX}
          >
            +.1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.plus1}
            sx={POSITIVE_BUTTON_SX}
          >
            +1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.plus10}
            sx={POSITIVE_BUTTON_SX}
          >
            +10
          </Button>
          
          {/* Negative adjustments */}
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.minus10}
            sx={NEGATIVE_BUTTON_SX}
          >
            -10
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.minus1}
            sx={NEGATIVE_BUTTON_SX}
          >
            -1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.minus010}
            sx={NEGATIVE_BUTTON_SX}
          >
            -.1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={amountAdjustmentHandlers.minus001}
            sx={NEGATIVE_BUTTON_SX}
          >
            -.01
          </Button>
        </Stack>
        
        <TextField
          fullWidth
          label="Amount"
          type="number"
          value={localAmount}
          onChange={(e) => setLocalAmount(e.target.value)}
          size="small"
        />
        {/* Date Shortcut Buttons */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleYesterdayMinus1}
            sx={DATE_BUTTON_SX}
          >
            Yesterday - 1
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleYesterday}
            sx={DATE_BUTTON_SX}
          >
            Yesterday
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={handleToday}
            sx={DATE_BUTTON_SX}
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
});

TransactionForm.displayName = 'TransactionForm';

export default TransactionForm;
