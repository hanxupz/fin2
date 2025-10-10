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
        minHeight: '140px', // Fixed minimum height for the card
        display: 'flex',
        flexDirection: 'column'
      }}>
        <CardContent sx={{ pb: 1, flexGrow: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            mb: 1,
            minHeight: '32px' // Fixed height for the amount and date row
          }}>
            <Typography variant="h6" sx={{ color, fontWeight: 600 }}>
              {transaction.amount?.toFixed(2)}€
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {transaction.date}
            </Typography>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            {transaction.description}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${CATEGORY_EMOJIS[transaction.category] || '❓'} ${transaction.category}`}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            <Chip
              label={transaction.account}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 2 }}
            />
            {transaction.control_date && (
              <Chip
                label={`📅 ${transaction.control_date}`}
                size="small"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            )}
          </Box>
        </CardContent>
        
        <CardActions sx={{ pt: 0, justifyContent: 'flex-end' }}>
          <Button size="small" onClick={() => onEdit(transaction)}>
            Edit
          </Button>
          <Button size="small" onClick={() => onClone(transaction)}>
            Clone
          </Button>
          <Button size="small" color="error" onClick={() => onDelete(transaction.id)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
});

TransactionItem.displayName = 'TransactionItem';

export default TransactionItem;