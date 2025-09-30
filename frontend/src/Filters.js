import React from "react";
import {
  Paper,
  Typography,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function Filters({
  filterCategory, setFilterCategory,
  filterAccount, setFilterAccount,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  categories,
  accounts
}) {
  return (
    <Paper style={{ padding: "1rem", marginBottom: "1rem" }}>
      <Typography variant="h6" gutterBottom>
        Filters
      </Typography>

      <Grid container spacing={2}>
        {/* Category */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Account */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Account</InputLabel>
            <Select
              label="Account"
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
            >
              <MenuItem value="">All Accounts</MenuItem>
              {accounts.map((a) => (
                <MenuItem key={a} value={a}>{a}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* From Date */}
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="From Date"
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
        </Grid>

        {/* To Date */}
        <Grid item xs={12} sm={6}>
          <DatePicker
            label="To Date"
            value={filterDateTo}
            onChange={setFilterDateTo}
            slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
          />
        </Grid>

        {/* Reset Button full width below */}
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </Paper>
  );
}

export default Filters;
