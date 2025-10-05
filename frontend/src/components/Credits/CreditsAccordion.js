import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, IconButton, Box, Stack, Divider, Tooltip, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { surfaceBoxSx } from "../../theme/primitives";

const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

const CreditsAccordion = ({
  credits,
  paymentsByCredit,
  onExpandFetchPayments,
  onEditCredit,
  onDeleteCredit,
  onAddPayment,
  onEditPayment,
  onDeletePayment
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel, creditId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    if (isExpanded) {
      onExpandFetchPayments(creditId);
    }
  };

  return (
    <Box>
      {credits.map((credit) => {
        const payments = paymentsByCredit[credit.id] || [];
        const totalPaid = payments.reduce((sum, p) => sum + p.value, 0);
        const remaining = credit.total_amount ? (credit.total_amount - totalPaid) : null;
        return (
          <Accordion key={credit.id} expanded={expanded === credit.id} onChange={handleChange(credit.id, credit.id)} sx={(t)=>({ ...surfaceBoxSx(t), p: 0, background: t.palette.background.paper })}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ flexGrow:1 }}>
                <Typography variant="subtitle1" fontWeight={600}>{credit.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly: {credit.monthly_value.toFixed(2)} | Day: {credit.payment_day}
                  {credit.total_amount && ` | Total: ${credit.total_amount.toFixed(2)}`}
                  {remaining !== null && ` | Remaining: ${remaining.toFixed(2)}`}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Add payment">
                  <IconButton
                    size="small"
                    onClick={(e)=>{ e.stopPropagation(); onAddPayment(credit); }}
                    sx={{ width: 32, height: 32 }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit credit">
                  <IconButton
                    size="small"
                    onClick={(e)=>{ e.stopPropagation(); onEditCredit(credit); }}
                    sx={{ width: 32, height: 32 }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete credit">
                  <IconButton
                    size="small"
                    onClick={(e)=>{ e.stopPropagation(); onDeleteCredit(credit.id); }}
                    sx={{ width: 32, height: 32 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                {payments.length === 0 && <Typography variant="body2" color="text.secondary">No payments recorded</Typography>}
                {payments.map(p => (
                  <Box key={p.id} sx={{ display:'flex', alignItems:'center', gap:1, border:'1px solid', borderColor:'divider', p:1, borderRadius:1 }}>
                    <Box sx={{ flexGrow:1 }}>
                      <Typography variant="body2" fontWeight={600}>{p.value.toFixed(2)}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(p.date)}</Typography>
                    </Box>
                    <Chip size="small" label={p.type === 'scheduled' ? 'Scheduled' : 'Off Schedule'} color={p.type === 'scheduled' ? 'primary' : 'default'} />
                    <IconButton size="small" onClick={()=>onEditPayment(credit, p)}><EditIcon fontSize="inherit" /></IconButton>
                    <IconButton size="small" onClick={()=>onDeletePayment(p.id, credit.id)}><DeleteIcon fontSize="inherit" /></IconButton>
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default CreditsAccordion;
