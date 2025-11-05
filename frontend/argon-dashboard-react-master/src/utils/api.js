// src/utils/api.js

const API_BASE_URL = "http://localhost:5290/api"; // Your backend API base URL

export async function fetchAuthenticatedData(urlPath, method = "GET", body = null) {
  const token = localStorage.getItem("authToken");

  if (!token) {
    // If no token, redirect to login or handle as unauthorized
    console.warn("No authentication token found. Redirecting to login...");
    throw new Error("Unauthorized: No authentication token found.");
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`, // Include the JWT token in the Authorization header
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${urlPath}`, options);

    if (response.status === 401) {
      // Token expired or invalid, clear it and force re-login
      localStorage.removeItem("authToken");
      throw new Error("Unauthorized: Session expired or invalid token. Please log in again.");
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText || response.statusText}`);
    }

    // Attempt to parse JSON, but handle cases where response is empty or not JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else if (response.status === 204) { // No Content
      return null;
    } else {
      return await response.text(); // Return text if not JSON, e.g., token on login
    }

  } catch (error) {
    console.error("fetchAuthenticatedData error:", error);
    throw error; // Re-throw to be handled by the calling component
  }
}