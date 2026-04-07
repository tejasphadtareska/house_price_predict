package com.example;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import java.util.Map;
import java.util.HashMap;

class PropertyFeaturesDTO {
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

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
@RequestMapping("/api")
public class MarketAnalysisController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String DEFAULT_ML_API_URL = "http://localhost:8000";
    private final String mlApiUrl = System.getenv().getOrDefault("ML_API_URL", DEFAULT_ML_API_URL).replaceAll("/+$", "");

    @GetMapping("/market-stats")
    public ResponseEntity<Map<String, Object>> getMarketStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averagePrice", 250000);
        stats.put("totalProperties", 49);
        stats.put("averageSqFt", 1800);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/what-if")
    public ResponseEntity<Map<String, Object>> whatIf(@Valid @RequestBody PropertyFeaturesDTO features) {
        try {
            if (features == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Request body cannot be empty"));
            }
            
            // Call ML API
            Map<String, Object> mlRequest = Map.of("features", features);
            ResponseEntity<Map> response = restTemplate.postForEntity(mlApiUrl + "/predict", mlRequest, Map.class);
            
            if (response.getBody() == null || !response.getBody().containsKey("predicted_price")) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Invalid response from ML API"));
            }
            
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "ML API is unavailable: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
}
