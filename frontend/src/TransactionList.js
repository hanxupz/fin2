import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button
} from "@mui/material";

function TransactionList({ filteredTransactions, editTransaction, deleteTransaction }) {
  if (filteredTransactions.length === 0) {
    return <Typography>No transactions found.</Typography>;
  }

  return (
    <>
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
    </>
  );
}

export default TransactionList;
