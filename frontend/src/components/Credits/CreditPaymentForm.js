import React from 'react';
import { Paper, Typography, TextField, Button, Stack, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { surfaceBoxSx } from '../../theme/primitives';

const CreditPaymentForm = ({
  value, setValue,
  date, setDate,
  type, setType,
  onSubmit,
  editingPaymentId
}) => {
  return (
    <Paper elevation={2} sx={(t)=>({ ...surfaceBoxSx(t), p:3 })}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {editingPaymentId ? 'Edit Payment' : 'Add Payment'}
      </Typography>
      <Stack spacing={2}>
        <TextField label="Value" type="number" size="small" fullWidth value={value} onChange={e=>setValue(e.target.value)} />
        <DatePicker label="Date" value={date} onChange={setDate} slotProps={{ textField: { size:'small', fullWidth:true }}} />
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={type} onChange={e=>setType(e.target.value)}>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="off_schedule">Off Schedule</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={onSubmit}>{editingPaymentId ? 'Update' : 'Add'} Payment</Button>
      </Stack>
    </Paper>
  );
};

export default CreditPaymentForm;
