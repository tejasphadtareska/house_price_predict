export const API_CONFIG = {
  java: process.env.NEXT_PUBLIC_JAVA_API_URL || 'http://localhost:8080',
  python: process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:3001',
}

export const ENDPOINTS = {
  marketStats: `${API_CONFIG.java}/api/market-stats`,
  whatIf: `${API_CONFIG.java}/api/what-if`,
  propertyEstimate: `${API_CONFIG.python}/estimate`,
}
