import React from "react";
import { useTheme } from "@mui/material/styles";
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
import { amountColor, surfaceBoxSx } from "../../theme/primitives";
import { CATEGORY_EMOJIS } from "../../constants";

function TransactionList({ filteredTransactions, editTransaction, deleteTransaction }) {
  const theme = useTheme();

  if (filteredTransactions.length === 0) {
    return <Typography variant="body2" color="text.secondary">No transactions found.</Typography>;
  }

  return (
    <Box sx={(t) => ({ ...surfaceBoxSx(t), p: 2 })}>
      <Grid container spacing={2}>
        {filteredTransactions.sort((a, b) => b.date - a.date).map((t) => {
          const color = amountColor(theme, t.amount);
          return (
            <Grid item xs={12} key={t.id}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" component="span" sx={{ lineHeight: 1 }}>
                      {CATEGORY_EMOJIS[t.category] || '💰'}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t.description}
                    </Typography>
                    <Chip size="small" label={t.category || '-'} sx={{ ml: 'auto' }} />
                  </Box>
                  <Typography variant="h6" sx={{ color, mt: 1, fontWeight: 700 }}>
                    {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}€
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1, fontSize: 12, color: 'text.secondary' }}>
                    <span>{t.date || '-'}  |  {t.account || '-'}</span>
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 0, pb: 1.5, px: 2 }}>
                  <Button size="small" onClick={() => editTransaction(t)}>Edit</Button>
                  <Button size="small" color="error" onClick={() => deleteTransaction(t.id)}>Delete</Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export { TransactionList as default };
