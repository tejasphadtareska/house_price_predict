package com.example;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class MarketAnalysisController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final String ML_API_URL = "http://localhost:8000";

    @GetMapping("/market-stats")
    public ResponseEntity<Map<String, Object>> getMarketStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("averagePrice", 250000);
        stats.put("totalProperties", 49);
        stats.put("averageSqFt", 1800);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/what-if")
    public ResponseEntity<Map<String, Object>> whatIf(@RequestBody Map<String, Object> features) {
        try {
            // Call ML API
            ResponseEntity<Map> response = restTemplate.postForEntity(ML_API_URL + "/predict", Map.of("features", features), Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }
}