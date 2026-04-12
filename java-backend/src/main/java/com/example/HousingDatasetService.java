package com.example;

import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class HousingDatasetService {
    private List<HousingRecord> records = List.of();

    @PostConstruct
    void load() {
        try (Reader reader = new InputStreamReader(
            new ClassPathResource("data/housing-market.csv").getInputStream(),
            StandardCharsets.UTF_8
        ); CSVReader csvReader = new CSVReader(reader)) {
            List<HousingRecord> loadedRecords = new ArrayList<>();
            csvReader.readNext();
            String[] row;
            while ((row = csvReader.readNext()) != null) {
                loadedRecords.add(new HousingRecord(
                    Long.parseLong(row[0]),
                    Double.parseDouble(row[1]),
                    Integer.parseInt(row[2]),
                    Double.parseDouble(row[3]),
                    Integer.parseInt(row[4]),
                    Double.parseDouble(row[5]),
                    Double.parseDouble(row[6]),
                    Double.parseDouble(row[7]),
                    Double.parseDouble(row[8])
                ));
            }
            records = List.copyOf(loadedRecords);
        } catch (IOException | CsvValidationException e) {
            throw new IllegalStateException("Failed to load housing dataset", e);
        }
    }

    public List<HousingRecord> findAll() {
        return records;
    }
}
