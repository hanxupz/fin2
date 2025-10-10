import React, { useState } from 'react';
import {
  Accordion, AccordionSummary, AccordionDetails,
  Typography, IconButton, Box, Stack, Tooltip, Chip
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
  onEditCredit,
  onDeleteCredit,
  onAddPayment,
  onEditPayment,
  onDeletePayment
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box sx={{ 
      '& .MuiAccordion-root': { mb: 1 },
      width: '100%',
      overflow: 'hidden'
    }}>
      {credits.map((credit, index) => {
        const payments = paymentsByCredit[credit.id] || [];
        const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);
        const remaining = credit.total_amount ? (credit.total_amount - totalPaid) : null;
        
        // Calculate progress percentage
        let progressPercentage = 0;
        if (credit.total_amount && credit.total_amount > 0) {
          const rawPercentage = (totalPaid / credit.total_amount) * 100;
          progressPercentage = Math.min(Math.max(rawPercentage, 0), 100);
        }
        
        return (
          <Accordion key={credit.id} expanded={expanded === credit.id} onChange={handleChange(credit.id, credit.id)} 
              sx={(t)=>({ 
                ...surfaceBoxSx(t), 
                p: 0, 
                background: t.palette.background.paper,
                minHeight: '60px',
                overflow: 'hidden', // Prevent content from overflowing
                '& .MuiAccordionSummary-root': {
                  minHeight: '56px !important'
                },
                '& .MuiAccordionSummary-content': {
                  margin: '8px 0 !important',
                  minWidth: 0, // Allow flex items to shrink
                  overflow: 'hidden'
                }
              })}>
            <AccordionSummary 
              expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ flexGrow:1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600} 
                    sx={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {credit.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                    {credit.total_amount && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Total: {credit.total_amount.toFixed(2)}€
                      </Typography>
                    )}
                    {remaining !== null && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Remaining: {remaining.toFixed(2)}€
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Tooltip title="Add payment">
                  <IconButton
                    size="small"
                    onClick={(e)=>{ e.stopPropagation(); onAddPayment(credit); }}
                    sx={{ width: 28, height: 28 }} // Reduced from 32px to 28px
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit credit">
                  <IconButton
                    size="small"
                    onClick={(e)=>{ e.stopPropagation(); onEditCredit(credit); }}
                    sx={{ width: 28, height: 28 }} // Reduced from 32px to 28px
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete credit">
                  <IconButton
                    size="small"
                    onClick={(e)=>{ e.stopPropagation(); onDeleteCredit(credit.id); }}
                    sx={{ width: 28, height: 28 }} // Reduced from 32px to 28px
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 1, pb: 1 }}>
              <Stack spacing={0.5}>
                {payments.length === 0 && <Typography variant="body2" color="text.secondary">No payments recorded</Typography>}
                {payments.map(p => (
                  <Box key={p.id} sx={{ display:'flex', alignItems:'center', gap:0.5, border:'1px solid', borderColor:'divider', p:0.75, borderRadius:1, minHeight: '36px' }}>
                    <Box sx={{ flexGrow:1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {p.value.toFixed(2)}€
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        {formatDate(p.date)}
                      </Typography>
                    </Box>
                    <Chip size="small" label={p.type === 'scheduled' ? 'Sched' : 'Off'} color={p.type === 'scheduled' ? 'primary' : 'default'} sx={{ height: '20px', fontSize: '0.65rem', flexShrink: 0 }} />
                    <IconButton size="small" onClick={()=>onEditPayment(credit, p)} sx={{ width: '24px', height: '24px', flexShrink: 0 }}><EditIcon sx={{ fontSize: '0.75rem' }} /></IconButton>
                    <IconButton size="small" onClick={()=>onDeletePayment(p.id, credit.id)} sx={{ width: '24px', height: '24px', flexShrink: 0 }}><DeleteIcon sx={{ fontSize: '0.75rem' }} /></IconButton>
                  </Box>
                ))}
                {/* Progress bar moved to bottom */}
                {credit.total_amount && credit.total_amount > 0 && (
                  <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        Payment Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {progressPercentage.toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        height: 8,
                        backgroundColor: (theme) => theme.palette.grey[200],
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Box
                        key={`progress-bar-${credit.id}-${Date.now()}`}
                        sx={{
                          width: `${progressPercentage}%`,
                          height: '100%',
                          backgroundColor: (theme) => 
                            totalPaid >= credit.total_amount 
                              ? theme.palette.success.main 
                              : theme.palette.primary.main,
                          borderRadius: 4,
                          transition: 'width 0.3s ease',
                          boxSizing: 'border-box'
                        }}
                        title={`${credit.name}: ${progressPercentage}%`}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Paid: {totalPaid.toFixed(2)}€
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total: {credit.total_amount.toFixed(2)}€
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
};

export default CreditsAccordion;
