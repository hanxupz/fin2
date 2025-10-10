import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Chip,
  Box
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { amountColor } from "../../theme/primitives";
import { CATEGORY_EMOJIS } from "../../constants";

const TransactionItem = React.memo(({ transaction, onEdit, onClone, onDelete }) => {
  const theme = useTheme();
  const color = amountColor(theme, transaction.amount);

  return (
    <Grid item xs={12}>
      <Card variant="outlined" sx={{ 
        borderRadius: 2,
        minHeight: '100px', // Reduced from 140px to 100px
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent sx={{ pb: 0.5, pt: 1.5, px: 2, flexGrow: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 0.5,
            minHeight: '24px' // Reduced from 32px to 24px
          }}>
            <Typography variant="h6" sx={{ color, fontWeight: 600, fontSize: '1rem' }}>
              {transaction.amount?.toFixed(2)}€
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {transaction.date}
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500, fontSize: '0.85rem' }}>
            {transaction.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
            <Chip
              label={`${CATEGORY_EMOJIS[transaction.category] || '❓'} ${transaction.category}`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2, height: '20px', fontSize: '0.65rem' }}
            />
            <Chip
              label={transaction.account}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 2, height: '20px', fontSize: '0.65rem' }}
            />
            {transaction.control_date && (
              <Chip
                label={`📅 ${transaction.control_date}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2, height: '20px', fontSize: '0.65rem' }}
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ pt: 0, pb: 1, px: 2, justifyContent: 'flex-end', minHeight: '32px' }}>
          <Button size="small" onClick={() => onEdit(transaction)} sx={{ minWidth: 'auto', px: 1 }}>
            Edit
          </Button>
          <Button size="small" onClick={() => onClone(transaction)} sx={{ minWidth: 'auto', px: 1 }}>
            Clone
          </Button>
          <Button size="small" color="error" onClick={() => onDelete(transaction.id)} sx={{ minWidth: 'auto', px: 1 }}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
});

TransactionItem.displayName = 'TransactionItem';

export default TransactionItem;