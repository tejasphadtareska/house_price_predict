package com.example;

public record MarketStatsFilter(
    Integer bedrooms,
    Double bathrooms,
    Integer yearBuilt,
    Double minPrice,
    Double maxPrice,
    Double minSquareFootage,
    Double maxSquareFootage,
    Double minLotSize,
    Double maxLotSize,
    Double minDistanceToCityCenter,
    Double maxDistanceToCityCenter,
    Double minSchoolRating,
    Double maxSchoolRating,
    Integer minYearBuilt,
    Integer maxYearBuilt
) {
    public String cacheKey() {
        return String.join("|",
            String.valueOf(bedrooms),
            String.valueOf(bathrooms),
            String.valueOf(yearBuilt),
            String.valueOf(minPrice),
            String.valueOf(maxPrice),
            String.valueOf(minSquareFootage),
            String.valueOf(maxSquareFootage),
            String.valueOf(minLotSize),
            String.valueOf(maxLotSize),
            String.valueOf(minDistanceToCityCenter),
            String.valueOf(maxDistanceToCityCenter),
            String.valueOf(minSchoolRating),
            String.valueOf(maxSchoolRating),
            String.valueOf(minYearBuilt),
            String.valueOf(maxYearBuilt)
        );
    }
}
