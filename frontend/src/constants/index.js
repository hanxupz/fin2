// Application constants
export const CATEGORIES = [
  "Comida", "Carro", "Tabaco", "Ajuste", "Salário", "Futebol",
  "Cartão Crédito", "Telemóvel", "Jogo", "Transferência", "Saúde",
  "Desktop", "Subscrições", "Tabaco Extra", "Noite",
  "Jogos PC/Switch/Play", "Cerveja", "Roupa", "Poupança", "Casa",
  "Shareworks", "Educação", "Outro", "Férias"
];

export const ACCOUNTS = [
  "Corrente", "Poupança Física", "Poupança Objectivo", "Shareworks", "Etoro",
  "Cartão Refeição", "Nexo", "Crédito", "Dívida", "Investimento"
];

// Map categories to emojis
export const CATEGORY_EMOJIS = {
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
  "Educação": "📚",
  "Outro": "❓",
  "Férias": "🏖️"
};

// Default values
export const DEFAULT_CATEGORY = "Comida";
export const DEFAULT_ACCOUNT = "Corrente";

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || "https://finance-backend.theonet.uk";
