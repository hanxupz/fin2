import React from "react";
import { Typography, Grid, Box } from "@mui/material";
import { surfaceBoxSx } from "../../theme/primitives";
import TransactionItem from "./TransactionItem";

const TransactionList = React.memo(({ filteredTransactions, editTransaction, deleteTransaction, cloneTransaction }) => {
  // Memoize sorted transactions to avoid sorting on every render
  const sortedTransactions = React.useMemo(() => {
    return [...filteredTransactions].sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : null;
      const dateB = b.date ? new Date(b.date) : null;
      
      if (dateA && dateB) {
        const dateDiff = dateB.getTime() - dateA.getTime();
        if (dateDiff !== 0) return dateDiff;
      }
      
      if (dateA && !dateB) return -1;
      if (!dateA && dateB) return 1;
      
      const createdA = new Date(a.createddate || 0);
      const createdB = new Date(b.createddate || 0);
      
      return createdB.getTime() - createdA.getTime();
    });
  }, [filteredTransactions]);

  if (filteredTransactions.length === 0) {
    return (
      <Box sx={(t) => ({ ...surfaceBoxSx(t), p: 2 })}>
        <Typography variant="body2" color="text.secondary">No transactions found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={(t) => ({ ...surfaceBoxSx(t), p: 2 })}>
      <Grid container spacing={2}>
        {sortedTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onEdit={editTransaction}
            onClone={cloneTransaction}
            onDelete={deleteTransaction}
          />
        ))}
      </Grid>
    </Box>
  );
});

TransactionList.displayName = 'TransactionList';

export default TransactionList;
