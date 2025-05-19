class ApiClient {
  constructor() {
    (this.baseURL = "http://localhost:4000/api/v1"),
      (this.defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
      });
  }

  async customFetch(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.defaultHeaders, ...options.headers };

      const config = {
        ...options,
        headers,
        credentials: "include",
      };

      console.log(`fetching from ${url}`)

      const response = await fetch(url, config);
      if (!response.ok) {
        console.log(response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Api error", error);
      throw new Error("Unable to get data through endpoint");
    }
  }

  async signup(name, email, password) {
    return this.customFetch("/user/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  }

  async login(email, password) {
    return this.customFetch("/user/login", {
      methods: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.customFetch("/user/profile", {
      methods: "GET",
    });
  }
}

const apiClient = new ApiClient();

export default apiClient;
