export interface PropertyData {
  square_footage: number
  bedrooms: number
  bathrooms: number
  year_built: number
  lot_size: number
  distance_to_city_center: number
  school_rating: number
}

export interface MarketStats {
  averagePrice: number
  totalProperties: number
  averageSqFt: number
}

export interface PredictionResponse {
  predicted_price: number
}

export interface EstimateRecord {
  data: PropertyData
  price: number
  timestamp: string
}

export interface ApiError {
  error?: string
  message?: string
}
