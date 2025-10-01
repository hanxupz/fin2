import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Stack
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { surfaceBoxSx } from "../../theme/primitives";

function Filters({
  filterCategory, setFilterCategory,
  filterAccount, setFilterAccount,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  categories,
  accounts
}) {
  const theme = useTheme();

  return (
    <Paper elevation={2} sx={(t) => ({ ...surfaceBoxSx(t), p: 3 })}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Filters
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Account</InputLabel>
            <Select
              label="Account"
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
            >
              <MenuItem value=""><em>All</em></MenuItem>
              {accounts.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="From"
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DatePicker
            label="To"
            value={filterDateTo}
            onChange={setFilterDateTo}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => {
                setFilterCategory("");
                setFilterAccount("");
                setFilterDateFrom(null);
                setFilterDateTo(null);
              }}
            >
              Reset
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default Filters;
