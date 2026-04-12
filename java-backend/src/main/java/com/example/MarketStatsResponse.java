package com.example;

import java.util.Map;

public record MarketStatsResponse(
    double averagePrice,
    double medianPrice,
    double averageSqFt,
    int totalProperties,
    Map<String, Long> priceDistribution,
    Map<String, Long> bedroomDistribution,
    Map<String, Long> bathroomDistribution,
    Map<String, Long> yearBuiltDistribution
) {
}
