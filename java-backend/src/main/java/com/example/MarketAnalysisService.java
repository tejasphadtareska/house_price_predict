package com.example;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.function.Predicate;
import java.util.stream.Collectors;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class MarketAnalysisService {
    private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("0.00");
    private final HousingDatasetService housingDatasetService;

    public MarketAnalysisService(HousingDatasetService housingDatasetService) {
        this.housingDatasetService = housingDatasetService;
    }

    @Cacheable(value = "marketStats", key = "#filter.cacheKey()")
    public MarketStatsResponse getMarketStats(MarketStatsFilter filter) {
        List<HousingRecord> filteredRecords = filterRecords(filter);
        if (filteredRecords.isEmpty()) {
            return new MarketStatsResponse(0, 0, 0, 0, Map.of(), Map.of(), Map.of(), Map.of());
        }

        List<Double> sortedPrices = filteredRecords.stream()
            .map(HousingRecord::price)
            .sorted()
            .toList();

        return new MarketStatsResponse(
            round(filteredRecords.stream().mapToDouble(HousingRecord::price).average().orElse(0)),
            round(calculateMedian(sortedPrices)),
            round(filteredRecords.stream().mapToDouble(HousingRecord::squareFootage).average().orElse(0)),
            filteredRecords.size(),
            buildPriceDistribution(filteredRecords),
            groupCounts(filteredRecords, record -> String.valueOf(record.bedrooms())),
            groupCounts(filteredRecords, record -> DECIMAL_FORMAT.format(record.bathrooms())),
            groupCounts(filteredRecords, record -> decadeBucket(record.yearBuilt()))
        );
    }

    public byte[] exportCsv(MarketStatsFilter filter) {
        StringBuilder csv = new StringBuilder();
        csv.append("id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price\n");
        for (HousingRecord record : filterRecords(filter)) {
            csv.append(record.id()).append(',')
                .append(record.squareFootage()).append(',')
                .append(record.bedrooms()).append(',')
                .append(record.bathrooms()).append(',')
                .append(record.yearBuilt()).append(',')
                .append(record.lotSize()).append(',')
                .append(record.distanceToCityCenter()).append(',')
                .append(record.schoolRating()).append(',')
                .append(record.price()).append('\n');
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportPdf(MarketStatsFilter filter) {
        MarketStatsResponse stats = getMarketStats(filter);
        try (PDDocument document = new PDDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
                contentStream.newLineAtOffset(50, 780);
                contentStream.showText("Housing Market Analysis Export");
                contentStream.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 11);
                contentStream.setLeading(16);
                contentStream.newLine();
                contentStream.newLine();
                contentStream.showText("Total Properties: " + stats.totalProperties());
                contentStream.newLine();
                contentStream.showText("Average Price: " + DECIMAL_FORMAT.format(stats.averagePrice()));
                contentStream.newLine();
                contentStream.showText("Median Price: " + DECIMAL_FORMAT.format(stats.medianPrice()));
                contentStream.newLine();
                contentStream.showText("Average Square Footage: " + DECIMAL_FORMAT.format(stats.averageSqFt()));
                contentStream.newLine();
                contentStream.newLine();
                contentStream.showText("Price Distribution:");
                for (Map.Entry<String, Long> entry : stats.priceDistribution().entrySet()) {
                    contentStream.newLine();
                    contentStream.showText(entry.getKey() + ": " + entry.getValue());
                }
                contentStream.endText();
            }

            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate PDF export", e);
        }
    }

    public List<HousingRecord> filterRecords(MarketStatsFilter filter) {
        Predicate<HousingRecord> predicate = record -> matchesExactFilters(record, filter)
            && matchesRangeFilters(record, filter);

        return housingDatasetService.findAll().stream()
            .filter(predicate)
            .sorted(Comparator.comparing(HousingRecord::id))
            .toList();
    }

    private boolean matchesExactFilters(HousingRecord record, MarketStatsFilter filter) {
        return (filter.bedrooms() == null || record.bedrooms() == filter.bedrooms())
            && (filter.bathrooms() == null || Double.compare(record.bathrooms(), filter.bathrooms()) == 0)
            && (filter.yearBuilt() == null || record.yearBuilt() == filter.yearBuilt());
    }

    private boolean matchesRangeFilters(HousingRecord record, MarketStatsFilter filter) {
        return isWithin(record.price(), filter.minPrice(), filter.maxPrice())
            && isWithin(record.squareFootage(), filter.minSquareFootage(), filter.maxSquareFootage())
            && isWithin(record.lotSize(), filter.minLotSize(), filter.maxLotSize())
            && isWithin(record.distanceToCityCenter(), filter.minDistanceToCityCenter(), filter.maxDistanceToCityCenter())
            && isWithin(record.schoolRating(), filter.minSchoolRating(), filter.maxSchoolRating())
            && isWithin(record.yearBuilt(), filter.minYearBuilt(), filter.maxYearBuilt());
    }

    private boolean isWithin(double value, Double min, Double max) {
        return (min == null || value >= min) && (max == null || value <= max);
    }

    private boolean isWithin(int value, Integer min, Integer max) {
        return (min == null || value >= min) && (max == null || value <= max);
    }

    private double calculateMedian(List<Double> sortedValues) {
        int size = sortedValues.size();
        int midpoint = size / 2;
        if (size % 2 == 0) {
            return (sortedValues.get(midpoint - 1) + sortedValues.get(midpoint)) / 2.0;
        }
        return sortedValues.get(midpoint);
    }

    private Map<String, Long> buildPriceDistribution(List<HousingRecord> records) {
        Map<String, Long> buckets = new LinkedHashMap<>();
        buckets.put("Under 200k", records.stream().filter(record -> record.price() < 200000).count());
        buckets.put("200k-299k", records.stream().filter(record -> record.price() >= 200000 && record.price() < 300000).count());
        buckets.put("300k-399k", records.stream().filter(record -> record.price() >= 300000 && record.price() < 400000).count());
        buckets.put("400k+", records.stream().filter(record -> record.price() >= 400000).count());
        return buckets;
    }

    private Map<String, Long> groupCounts(List<HousingRecord> records, Function<HousingRecord, String> classifier) {
        return records.stream()
            .collect(Collectors.groupingBy(classifier, TreeMap::new, Collectors.counting()));
    }

    private String decadeBucket(int yearBuilt) {
        int decade = (yearBuilt / 10) * 10;
        return decade + "s";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
