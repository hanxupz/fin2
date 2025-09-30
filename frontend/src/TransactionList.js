import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button
} from "@mui/material";

function TransactionList({ filteredTransactions, editTransaction, deleteTransaction }) {
  const theme = useTheme();

  if (filteredTransactions.length === 0) {
    return <Typography>No transactions found.</Typography>;
  }

  return (
    <div style={{ background: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 8, padding: 16 }}>
      {filteredTransactions.map((t) => (
        <Card key={t.id} style={{ marginBottom: "1rem" }}>
          <CardContent>
            <Typography variant="subtitle1">
              {t.description} {t.amount.toFixed(2)}€
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Date: {t.date || "-"} | Category: {t.category || "-"} | Account: {t.account || "-"}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => editTransaction(t)}>Edit</Button>
            <Button size="small" color="error" onClick={() => deleteTransaction(t.id)}>Delete</Button>
          </CardActions>
        </Card>
      ))}
    </div>
  );
}

export default TransactionList;
