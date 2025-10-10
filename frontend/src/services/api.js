import { API_BASE_URL } from '../constants';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (response.ok) {
      return await response.json();
    }
    
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  // Authentication endpoints
  async register(username, password) {
    const response = await fetch(`${this.baseURL}/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ username, password })
    });
    
    return this.handleResponse(response);
  }

  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${this.baseURL}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
    
    return this.handleResponse(response);
  }

  // Transaction endpoints
  async getTransactions(token, limit = 10000, offset = 0) {
    const response = await fetch(`${this.baseURL}/transactions/?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    
    return this.handleResponse(response);
  }

  async getTransactionsCount(token) {
    const response = await fetch(`${this.baseURL}/transactions/count`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    
    return this.handleResponse(response);
  }

  async getAllTransactions(token) {
    try {
      // First get the total count
      const countResult = await this.getTransactionsCount(token);
      const totalCount = countResult.total;
      
      // Then fetch all transactions with the correct limit
      return await this.getTransactions(token, totalCount || 10000);
    } catch (error) {
      console.warn('Could not get transaction count, using high limit fallback:', error);
      // Fallback to high limit if count fails
      return await this.getTransactions(token, 10000);
    }
  }

  async createTransaction(transaction, token) {
    const response = await fetch(`${this.baseURL}/transactions/`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(transaction)
    });
    
    return this.handleResponse(response);
  }

  async createTransactionsBulk(transactions, token) {
    const response = await fetch(`${this.baseURL}/transactions/bulk/`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(transactions)
    });
    
    return this.handleResponse(response);
  }

  async updateTransaction(id, transaction, token) {
    const response = await fetch(`${this.baseURL}/transactions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(transaction)
    });
    
    return this.handleResponse(response);
  }

  async deleteTransaction(id, token) {
    const response = await fetch(`${this.baseURL}/transactions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token)
    });
    
    if (response.ok) {
      return { success: true };
    }
    
    return this.handleResponse(response);
  }

  // Control date endpoints
  async getControlDate(token) {
    const response = await fetch(`${this.baseURL}/config/control_date/`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    
    return this.handleResponse(response);
  }

  async setControlDate(config, token) {
    const response = await fetch(`${this.baseURL}/config/control_date/`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(config)
    });
    
    return this.handleResponse(response);
  }

  // Credits endpoints
  async getCredits(token) {
    const response = await fetch(`${this.baseURL}/credits/`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    return this.handleResponse(response);
  }

  async createCredit(credit, token) {
    const response = await fetch(`${this.baseURL}/credits/`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(credit)
    });
    return this.handleResponse(response);
  }

  async updateCredit(id, credit, token) {
    const response = await fetch(`${this.baseURL}/credits/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(credit)
    });
    return this.handleResponse(response);
  }

  async deleteCredit(id, token) {
    const response = await fetch(`${this.baseURL}/credits/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) return { success: true };
    return this.handleResponse(response);
  }

  // Credit payments
  async getCreditPayments(creditId, token) {
    const response = await fetch(`${this.baseURL}/credits/${creditId}/payments`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    return this.handleResponse(response);
  }

  async createCreditPayment(payment, token) {
    const response = await fetch(`${this.baseURL}/credits/payments`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(payment)
    });
    return this.handleResponse(response);
  }

  async updateCreditPayment(paymentId, payment, token) {
    const response = await fetch(`${this.baseURL}/credits/payments/${paymentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(payment)
    });
    return this.handleResponse(response);
  }

  async deleteCreditPayment(paymentId, token) {
    const response = await fetch(`${this.baseURL}/credits/payments/${paymentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token)
    });
    if (response.ok) return { success: true };
    return this.handleResponse(response);
  }

  // Budget Preferences endpoints
  async getBudgetPreferences(token) {
    const response = await fetch(`${this.baseURL}/budget-preferences/`, {
      method: 'GET',
      headers: this.getAuthHeaders(token)
    });
    return this.handleResponse(response);
  }

  async createBudgetPreference(budgetPreference, token) {
    const response = await fetch(`${this.baseURL}/budget-preferences/`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(budgetPreference)
    });
    return this.handleResponse(response);
  }

  async updateBudgetPreference(id, budgetPreference, token) {
    const response = await fetch(`${this.baseURL}/budget-preferences/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(budgetPreference)
    });
    return this.handleResponse(response);
  }

  async deleteBudgetPreference(id, token) {
    const response = await fetch(`${this.baseURL}/budget-preferences/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token)
    });
    
    if (response.ok) {
      // 204 No Content has no body, so just return success
      if (response.status === 204) {
        return { success: true };
      }
      // For other successful responses, try to parse JSON
      return await response.json();
    }
    
    // Handle error responses
    return this.handleResponse(response);
  }

  async validateBudgetPreferences(token) {
    const response = await fetch(`${this.baseURL}/budget-preferences/validate`, {
      method: 'POST',
      headers: this.getAuthHeaders(token)
    });
    return this.handleResponse(response);
  }
}

export default new ApiService();
