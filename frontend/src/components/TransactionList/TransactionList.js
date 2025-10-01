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
    <div>
      {filteredTransactions.map((t) => (
        <div key={t.id} className="transaction-card">
          <div className="transaction-info">
            <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>
              {categoryEmojis[t.category] || "💰"}
            </span>
            {t.description}
          </div>
          
          <div className="transaction-amount" style={{ 
            color: t.amount >= 0 ? '#059669' : '#dc2626' 
          }}>
            {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}€
          </div>
          
          <div className="transaction-meta">
            <div className="transaction-meta-item">
              <span className="transaction-meta-label">Date</span>
              <span className="transaction-meta-value">{t.date || "-"}</span>
            </div>
            <div className="transaction-meta-item">
              <span className="transaction-meta-label">Category</span>
              <span className="transaction-meta-value">{t.category || "-"}</span>
            </div>
            <div className="transaction-meta-item">
              <span className="transaction-meta-label">Account</span>
              <span className="transaction-meta-value">{t.account || "-"}</span>
            </div>
            <div className="transaction-meta-item">
              <span className="transaction-meta-label">Control Date</span>
              <span className="transaction-meta-value">{t.control_date || "-"}</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(0,0,0,0.06)'
          }}>
            <button 
              className="secondary-button"
              onClick={() => editTransaction(t)}
              style={{ flex: '1', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              Edit
            </button>
            <button 
              className="secondary-button"
              onClick={() => deleteTransaction(t.id)}
              style={{ 
                flex: '1', 
                padding: '0.5rem 1rem', 
                fontSize: '0.875rem',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                borderColor: 'rgba(239, 68, 68, 0.2)'
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export { TransactionList as default };
