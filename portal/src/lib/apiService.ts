import { ENDPOINTS } from './config'
import type { MarketStats, PropertyData, PredictionResponse } from './types'

// Validation helpers
const validateMarketStats = (data: unknown): MarketStats => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid market stats response: not an object')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj.averagePrice !== 'number' || typeof obj.totalProperties !== 'number' || typeof obj.averageSqFt !== 'number') {
    throw new Error('Invalid market stats: missing required fields (averagePrice, totalProperties, averageSqFt)')
  }
  return data as MarketStats
}

const validatePredictionResponse = (data: unknown): PredictionResponse => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid prediction response: not an object')
  }
  const obj = data as Record<string, unknown>
  if (typeof obj.predicted_price !== 'number') {
    throw new Error('Invalid prediction: missing required field (predicted_price)')
  }
  return data as PredictionResponse
}

// API Service
class ApiService {
  private async fetchWithValidation<T>(
    url: string,
    options?: RequestInit,
    validator?: (data: unknown) => T
  ): Promise<T> {
    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (validator) {
        return validator(data)
      }
      return data as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unexpected error occurred')
    }
  }

  async getMarketStats(): Promise<MarketStats> {
    return this.fetchWithValidation<MarketStats>(
      ENDPOINTS.marketStats,
      undefined,
      validateMarketStats
    )
  }

  async getPropertyEstimate(features: PropertyData): Promise<PredictionResponse> {
    return this.fetchWithValidation<PredictionResponse>(
      ENDPOINTS.propertyEstimate,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      },
      validatePredictionResponse
    )
  }

  async runWhatIfAnalysis(features: PropertyData): Promise<PredictionResponse> {
    return this.fetchWithValidation<PredictionResponse>(
      ENDPOINTS.whatIf,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      },
      validatePredictionResponse
    )
  }
}

export const apiService = new ApiService()
