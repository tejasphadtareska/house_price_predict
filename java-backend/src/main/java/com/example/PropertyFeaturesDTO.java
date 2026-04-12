package com.example;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class PropertyFeaturesDTO {
    @NotNull(message = "square_footage is required")
    @Positive(message = "square_footage must be positive")
    public Double square_footage;

    @NotNull(message = "bedrooms is required")
    @Min(value = 1, message = "bedrooms must be at least 1")
    @Max(value = 20, message = "bedrooms must not exceed 20")
    public Integer bedrooms;

    @NotNull(message = "bathrooms is required")
    @Positive(message = "bathrooms must be positive")
    @Max(value = 20, message = "bathrooms must not exceed 20")
    public Double bathrooms;

    @NotNull(message = "year_built is required")
    @Min(value = 1800, message = "year_built must be >= 1800")
    @Max(value = 2100, message = "year_built must be <= 2100")
    public Integer year_built;

    @NotNull(message = "lot_size is required")
    @Positive(message = "lot_size must be positive")
    public Double lot_size;

    @NotNull(message = "distance_to_city_center is required")
    @PositiveOrZero(message = "distance_to_city_center must be >= 0")
    public Double distance_to_city_center;

    @NotNull(message = "school_rating is required")
    @Min(value = 0, message = "school_rating must be >= 0")
    @Max(value = 10, message = "school_rating must be <= 10")
    public Double school_rating;
}
