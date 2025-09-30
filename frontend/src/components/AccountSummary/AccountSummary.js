import React from "react";
import { Card, CardContent, Typography, Grid, useTheme } from "@mui/material";

const AccountSummary = ({ transactions, controlDate }) => {
  const theme = useTheme();

  const filteredTransactions = transactions.filter(
    (t) =>
      t.control_date &&
      new Date(t.control_date).toDateString() ===
        new Date(controlDate).toDateString()
  );

  // Display names for cards
  const accounts = ["Corrente", "Poupança", "Investimento", "All"];

  // Totals initialization
  const totals = {
    Corrente: 0,
    Poupança: 0,
    Investimento: 0,
    All: 0,
  };

  filteredTransactions.forEach((t) => {
    if (t.account === "Corrente") {
      totals.Corrente += t.amount;
    } else if (t.account === "Poupança Física" || t.account === "Poupança Objectivo") {
      totals.Poupança += t.amount;
    } else if (t.account === "Investimento") {
      totals.Investimento += t.amount;
    }
    totals.All += t.amount;
  });

  return (
    <div style={{ background: theme.palette.background.paper, color: theme.palette.text.primary, borderRadius: 8, padding: 16 }}>
      <Grid container spacing={2} style={{ marginBottom: "1rem" }}>
        {accounts.map((acc) => (
          <Grid item xs={12} md={3} key={acc}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{acc}</Typography>
                <Typography variant="h6">{totals[acc].toFixed(2)}€</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default AccountSummary;
