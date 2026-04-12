/**
 * API.JS - API calls management
 * Handles all HTTP requests to the backend
 */

const API = {
  /**
   * Fetch IPO data for current user
   * @param {string} username - Username to fetch data for
   * @returns {Promise<Object>} API response
   */
  fetchIPOData: async (username) => {
    try {
      const url = `${CONFIG.API_URL}?username=${encodeURIComponent(username)}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error("Error fetching IPO data:", error);
      throw error;
    }
  },

  /**
   * Add or edit IPO data
   * @param {string} action - 'add' or 'edit'
   * @param {string} username - Current user
   * @param {Object} data - IPO data object
   * @returns {Promise<Object>} API response
   */
  saveIPO: async (action, username, data) => {
    const payload = {
      action: action,
      username: username,
      ...data,
    };
    return API._sendRequest(payload);
  },

  /**
   * Delete IPO data
   * @param {string} id - IPO ID to delete
   * @param {string} username - Current user
   * @returns {Promise<Object>} API response
   */
  deleteIPO: async (id, username) => {
    const payload = {
      action: CONFIG.API_ACTIONS.DELETE,
      id: id,
      username: username,
    };
    return API._sendRequest(payload);
  },

  /**
   * Update IPO (mark as sold)
   * @param {string} username - Current user
   * @param {string} id - IPO ID
   * @param {number} hargaJual - Selling price
   * @param {string} tanggalJual - Selling date
   * @returns {Promise<Object>} API response
   */
  updateIPO: async (username, id, hargaJual, tanggalJual) => {
    const payload = {
      action: CONFIG.API_ACTIONS.UPDATE,
      username: username,
      id: id,
      harga_jual: hargaJual,
      tanggal_jual: tanggalJual,
      status: CONFIG.STATUS.SOLD,
    };
    return API._sendRequest(payload);
  },

  /**
   * Authenticate user (login)
   * @param {string} username - Username
   * @param {string} hashedPassword - SHA-256 hashed password
   * @returns {Promise<Object>} API response
   */
  login: async (username, hashedPassword) => {
    const payload = {
      action: CONFIG.API_ACTIONS.LOGIN,
      username: username,
      password: hashedPassword,
    };
    return API._sendRequest(payload);
  },

  /**
   * Register new user
   * @param {string} username - Username
   * @param {string} hashedPassword - SHA-256 hashed password
   * @returns {Promise<Object>} API response
   */
  register: async (username, hashedPassword) => {
    const payload = {
      action: CONFIG.API_ACTIONS.REGISTER,
      username: username,
      password: hashedPassword,
    };
    return API._sendRequest(payload);
  },

  /**
   * Internal method to send HTTP requests
   * @private
   * @param {Object} payload - Request payload
   * @returns {Promise<Object>} API response
   */
  _sendRequest: async (payload) => {
    try {
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  },
};
