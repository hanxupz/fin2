import React from "react";
import { useTheme } from "@mui/material/styles";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button
} from "@mui/material";

// Map categories to emojis
const categoryEmojis = {
  "Comida": "🍔",
  "Carro": "🚗",
  "Tabaco": "🚬",
  "Ajuste": "🛠️",
  "Salário": "💵",
  "Futebol": "⚽",
  "Cartão Crédito": "💳",
  "Telemóvel": "📱",
  "Jogo": "🎲",
  "Transferência": "🔄",
  "Saúde": "🩺",
  "Desktop": "🖥️",
  "Subscrições": "📦",
  "Tabaco Extra": "🚬",
  "Noite": "🌙",
  "Jogos PC/Switch/Play": "🎮",
  "Cerveja": "🍺",
  "Roupa": "👕",
  "Poupança": "💰",
  "Casa": "🏠",
  "Shareworks": "📈",
  "Educação": "🎓",
  "Outro": "❓",
  "Férias": "🏖️"
};

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
              {(categoryEmojis[t.category] || t.category || "-")} {t.amount.toFixed(2)}€
            </Typography>
            <Typography variant="body2" style={{ color: theme.palette.text.primary }}>
              {(t.date || "-")} | {t.description} | {(t.account || "-")}
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

export { TransactionList as default };
