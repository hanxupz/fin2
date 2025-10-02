import React from 'react';
import { Paper, Typography, TextField, Button, Stack } from '@mui/material';
import { surfaceBoxSx } from '../../theme/primitives';

const CreditForm = ({
  name, setName,
  monthlyValue, setMonthlyValue,
  paymentDay, setPaymentDay,
  totalAmount, setTotalAmount,
  onSubmit,
  editingId
}) => {
  return (
    <Paper elevation={2} sx={(t)=>({ ...surfaceBoxSx(t), p:3 })}>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {editingId ? 'Edit Credit' : 'Add Credit'}
      </Typography>
      <Stack spacing={2}>
        <TextField label="Name" size="small" fullWidth value={name} onChange={e=>setName(e.target.value)} />
        <TextField label="Monthly Value" type="number" size="small" fullWidth value={monthlyValue} onChange={e=>setMonthlyValue(e.target.value)} />
        <TextField label="Payment Day" type="number" size="small" fullWidth value={paymentDay} onChange={e=>setPaymentDay(e.target.value)} />
        <TextField label="Total Amount (optional)" type="number" size="small" fullWidth value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} />
        <Button variant="contained" onClick={onSubmit}>{editingId ? 'Update' : 'Create'} Credit</Button>
      </Stack>
    </Paper>
  );
};

export default CreditForm;
