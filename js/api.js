// ============================================================================
// API CLIENT FOR THE READING ROOM (CONNECTED TO RENDER BACKEND)
// ============================================================================

// Default API URL (can be updated via UI or localStorage)
const DEFAULT_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://backand-z03g.onrender.com';

class ApiClient {
  constructor() {
    this.baseUrl = localStorage.getItem('backend_api_url') || DEFAULT_API_URL;
    this.isOnline = false;
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  setBaseUrl(newUrl) {
    let cleanUrl = newUrl.trim().replace(/\/+$/, '');
    this.baseUrl = cleanUrl;
    localStorage.setItem('backend_api_url', cleanUrl);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (err) {
      console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, err.message);
      throw err;
    }
  }

  // Health / Ping
  async ping() {
    try {
      const data = await this.request('/health');
      this.isOnline = (data.status === 'online');
      return { online: true, data };
    } catch (err) {
      this.isOnline = false;
      return { online: false, error: err.message };
    }
  }

  // Hardware Status & Telemetry
  async getHardwareStatus() {
    try {
      const res = await this.request('/hardware/status');
      return res.hardware || null;
    } catch (e) {
      return null;
    }
  }

  async syncHardware(data) {
    return this.request('/hardware/sync', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async verifyRfid(cardUid) {
    return this.request('/hardware/verify-rfid', {
      method: 'POST',
      body: JSON.stringify({ cardUid })
    });
  }

  // Dashboard Overview
  async getOverview() {
    return this.request('/overview');
  }

  // Books
  async getBooks() {
    const res = await this.request('/books');
    return res.data || [];
  }

  async createBook(book) {
    return this.request('/books', {
      method: 'POST',
      body: JSON.stringify(book)
    });
  }

  async updateBook(id, updates) {
    return this.request(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteBook(id) {
    return this.request(`/books/${id}`, {
      method: 'DELETE'
    });
  }

  // Lockers
  async getLockers() {
    const res = await this.request('/lockers');
    return res.data || [];
  }

  async createLocker(locker) {
    return this.request('/lockers', {
      method: 'POST',
      body: JSON.stringify(locker)
    });
  }

  async toggleLocker(id) {
    return this.request(`/lockers/${id}/toggle`, {
      method: 'PUT'
    });
  }

  async deleteLocker(id) {
    return this.request(`/lockers/${id}`, {
      method: 'DELETE'
    });
  }

  // Users
  async getUsers() {
    const res = await this.request('/users');
    return res.data || [];
  }

  async createUser(user) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, {
      method: 'DELETE'
    });
  }

  // RFID Cards
  async getRfidCards() {
    const res = await this.request('/rfid-cards');
    return res.data || [];
  }

  async createRfidCard(card) {
    return this.request('/rfid-cards', {
      method: 'POST',
      body: JSON.stringify(card)
    });
  }

  async deleteRfidCard(uid) {
    return this.request(`/rfid-cards/${uid}`, {
      method: 'DELETE'
    });
  }

  // Transactions
  async getTransactions() {
    const res = await this.request('/transactions');
    return res.data || [];
  }

  async borrowBook({ userId, bookId, lockerId, borrowDays }) {
    return this.request('/transactions/borrow', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId, lockerId, borrowDays })
    });
  }

  async returnBook({ userId, bookId, lockerId }) {
    return this.request('/transactions/return', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId, lockerId })
    });
  }

  // Notifications
  async getNotifications() {
    const res = await this.request('/notifications');
    return res.data || [];
  }

  // Settings
  async getSettings() {
    const res = await this.request('/settings');
    return res.data || [];
  }

  async updateSetting(key, value) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value })
    });
  }

  // Reset
  async resetDatabase() {
    return this.request('/db/reset', {
      method: 'POST'
    });
  }
}

window.apiClient = new ApiClient();
