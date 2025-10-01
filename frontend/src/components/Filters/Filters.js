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
  const theme = useTheme();

  return (
    <div className="filters">
      <div className="filters-grid">
        {/* Category */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filters select"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Account */}
        <div className="filter-group">
          <label className="filter-label">Account</label>
          <select
            className="filters select"
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        {/* From Date */}
        <div className="filter-group">
          <label className="filter-label">From Date</label>
          <DatePicker
            value={filterDateFrom}
            onChange={setFilterDateFrom}
            slotProps={{ textField: { className: "filters input" } }}
          />
        </div>

        {/* To Date */}
        <div className="filter-group">
          <label className="filter-label">To Date</label>
          <DatePicker
            value={filterDateTo}
            onChange={setFilterDateTo}
            slotProps={{ textField: { className: "filters input" } }}
          />
        </div>

        {/* Reset Button */}
        <div className="filter-group" style={{ gridColumn: 'span 2' }}>
          <button
            className="secondary-button"
            onClick={() => {
              setFilterCategory("");
              setFilterAccount("");
              setFilterDateFrom(null);
              setFilterDateTo(null);
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default Filters;
