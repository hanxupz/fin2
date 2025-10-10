import React from "react";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { surfaceBoxSx } from "../../theme/primitives";

function Filters({
  filterCategory, setFilterCategory,
  filterAccount, setFilterAccount,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  filterControlDate, setFilterControlDate,
  categories,
  accounts
}) {


  return (
    <Stack spacing={1.5} sx={(t)=>({ ...surfaceBoxSx(t), p: 2, background: t.palette.background.paper })}>
      <Stack direction="row" spacing={1}>
        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
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
        <FormControl size="small" sx={{ minWidth: 120, flex: 1 }}>
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
      </Stack>
      <Stack direction="row" spacing={1}>
        <DatePicker
          label="From"
          value={filterDateFrom}
          onChange={setFilterDateFrom}
          slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
        />
        <DatePicker
          label="To"
          value={filterDateTo}
          onChange={setFilterDateTo}
          slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
        />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <DatePicker
          label="Control Date"
          value={filterControlDate}
          onChange={setFilterControlDate}
          slotProps={{ textField: { size: 'small', sx: { flex: 1 } } }}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            setFilterCategory("");
            setFilterAccount("");
            setFilterDateFrom(null);
            setFilterDateTo(null);
            setFilterControlDate(null);
          }}
          sx={{ minWidth: 'auto', px: 2 }}
        >
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}

export default Filters;
