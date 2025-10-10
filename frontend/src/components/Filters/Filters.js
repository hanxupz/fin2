import React from "react";
import { useTheme } from "@mui/material/styles";
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
    <Stack spacing={2} sx={(t)=>({ ...surfaceBoxSx(t), p: 3, background: t.palette.background.paper })}>
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
      <DatePicker
        label="From"
        value={filterDateFrom}
        onChange={setFilterDateFrom}
        slotProps={{ textField: { size: 'small', fullWidth: true } }}
      />
      <DatePicker
        label="To"
        value={filterDateTo}
        onChange={setFilterDateTo}
        slotProps={{ textField: { size: 'small', fullWidth: true } }}
      />
      <DatePicker
        label="Control Date"
        value={filterControlDate}
        onChange={setFilterControlDate}
        slotProps={{ textField: { size: 'small', fullWidth: true } }}
      />
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button
          variant="outlined"
          onClick={() => {
            setFilterCategory("");
            setFilterAccount("");
            setFilterDateFrom(null);
            setFilterDateTo(null);
            setFilterControlDate(null);
          }}
        >
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}

export default Filters;
