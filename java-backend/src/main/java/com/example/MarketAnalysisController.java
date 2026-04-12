package com.example;

import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
@RequestMapping("/api")
public class MarketAnalysisController {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String DEFAULT_ML_API_URL = "http://localhost:8000";
    private final String mlApiUrl = System.getenv().getOrDefault("ML_API_URL", DEFAULT_ML_API_URL).replaceAll("/+$", "");
    private final MarketAnalysisService marketAnalysisService;

    public MarketAnalysisController(MarketAnalysisService marketAnalysisService) {
        this.marketAnalysisService = marketAnalysisService;
    }

    @GetMapping("/market-stats")
    public ResponseEntity<MarketStatsResponse> getMarketStats(
        @RequestParam(required = false) Integer bedrooms,
        @RequestParam(required = false) Double bathrooms,
        @RequestParam(required = false) Integer yearBuilt,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(required = false) Double minSquareFootage,
        @RequestParam(required = false) Double maxSquareFootage,
        @RequestParam(required = false) Double minLotSize,
        @RequestParam(required = false) Double maxLotSize,
        @RequestParam(required = false) Double minDistanceToCityCenter,
        @RequestParam(required = false) Double maxDistanceToCityCenter,
        @RequestParam(required = false) Double minSchoolRating,
        @RequestParam(required = false) Double maxSchoolRating,
        @RequestParam(required = false) Integer minYearBuilt,
        @RequestParam(required = false) Integer maxYearBuilt
    ) {
        return ResponseEntity.ok(marketAnalysisService.getMarketStats(buildFilter(
            bedrooms,
            bathrooms,
            yearBuilt,
            minPrice,
            maxPrice,
            minSquareFootage,
            maxSquareFootage,
            minLotSize,
            maxLotSize,
            minDistanceToCityCenter,
            maxDistanceToCityCenter,
            minSchoolRating,
            maxSchoolRating,
            minYearBuilt,
            maxYearBuilt
        )));
    }

    @GetMapping(value = "/market-stats/export.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(
        @RequestParam(required = false) Integer bedrooms,
        @RequestParam(required = false) Double bathrooms,
        @RequestParam(required = false) Integer yearBuilt,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(required = false) Double minSquareFootage,
        @RequestParam(required = false) Double maxSquareFootage,
        @RequestParam(required = false) Double minLotSize,
        @RequestParam(required = false) Double maxLotSize,
        @RequestParam(required = false) Double minDistanceToCityCenter,
        @RequestParam(required = false) Double maxDistanceToCityCenter,
        @RequestParam(required = false) Double minSchoolRating,
        @RequestParam(required = false) Double maxSchoolRating,
        @RequestParam(required = false) Integer minYearBuilt,
        @RequestParam(required = false) Integer maxYearBuilt
    ) {
        byte[] body = marketAnalysisService.exportCsv(buildFilter(
            bedrooms,
            bathrooms,
            yearBuilt,
            minPrice,
            maxPrice,
            minSquareFootage,
            maxSquareFootage,
            minLotSize,
            maxLotSize,
            minDistanceToCityCenter,
            maxDistanceToCityCenter,
            minSchoolRating,
            maxSchoolRating,
            minYearBuilt,
            maxYearBuilt
        ));

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=market-stats.csv")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(body);
    }

    @GetMapping(value = "/market-stats/export.pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf(
        @RequestParam(required = false) Integer bedrooms,
        @RequestParam(required = false) Double bathrooms,
        @RequestParam(required = false) Integer yearBuilt,
        @RequestParam(required = false) Double minPrice,
        @RequestParam(required = false) Double maxPrice,
        @RequestParam(required = false) Double minSquareFootage,
        @RequestParam(required = false) Double maxSquareFootage,
        @RequestParam(required = false) Double minLotSize,
        @RequestParam(required = false) Double maxLotSize,
        @RequestParam(required = false) Double minDistanceToCityCenter,
        @RequestParam(required = false) Double maxDistanceToCityCenter,
        @RequestParam(required = false) Double minSchoolRating,
        @RequestParam(required = false) Double maxSchoolRating,
        @RequestParam(required = false) Integer minYearBuilt,
        @RequestParam(required = false) Integer maxYearBuilt
    ) {
        byte[] body = marketAnalysisService.exportPdf(buildFilter(
            bedrooms,
            bathrooms,
            yearBuilt,
            minPrice,
            maxPrice,
            minSquareFootage,
            maxSquareFootage,
            minLotSize,
            maxLotSize,
            minDistanceToCityCenter,
            maxDistanceToCityCenter,
            minSchoolRating,
            maxSchoolRating,
            minYearBuilt,
            maxYearBuilt
        ));

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=market-stats.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(body);
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

    private MarketStatsFilter buildFilter(
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
        return new MarketStatsFilter(
            bedrooms,
            bathrooms,
            yearBuilt,
            minPrice,
            maxPrice,
            minSquareFootage,
            maxSquareFootage,
            minLotSize,
            maxLotSize,
            minDistanceToCityCenter,
            maxDistanceToCityCenter,
            minSchoolRating,
            maxSchoolRating,
            minYearBuilt,
            maxYearBuilt
        );
    }
}
