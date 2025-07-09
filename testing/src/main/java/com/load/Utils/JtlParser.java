package com.load.Utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class JtlParser {

    public static class Sample {
        public String label;
        public long timestamp;
        public long elapsed;
        public boolean success;
        public String responseCode;
        public String threadName;
        // Add other fields as needed
    }

    public static Map<String, Object> parseJtl(Path jtlFilePath) throws Exception {
        List<Sample> samples = new ArrayList<>();
        long totalElapsed = 0;
        int totalSamples = 0;
        int errorCount = 0;

        try (BufferedReader br = new BufferedReader(new FileReader(jtlFilePath.toFile()))) {
            String headerLine = br.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("Empty JTL file");
            }
            String[] headers = headerLine.split(",");

            // Find indexes of important columns
            int labelIdx = -1, timestampIdx = -1, elapsedIdx = -1, successIdx = -1;
            for (int i = 0; i < headers.length; i++) {
                String h = headers[i].trim();
                if (h.equalsIgnoreCase("label")) labelIdx = i;
                else if (h.equalsIgnoreCase("timeStamp")) timestampIdx = i;
                else if (h.equalsIgnoreCase("elapsed")) elapsedIdx = i;
                else if (h.equalsIgnoreCase("success")) successIdx = i;
            }

            if (labelIdx == -1 || timestampIdx == -1 || elapsedIdx == -1 || successIdx == -1) {
                throw new IllegalArgumentException("JTL file missing required columns");
            }

            String line;
            while ((line = br.readLine()) != null) {
                String[] parts = line.split(",");
                Sample sample = new Sample();
                sample.label = parts[labelIdx];
                sample.timestamp = Long.parseLong(parts[timestampIdx]);
                sample.elapsed = Long.parseLong(parts[elapsedIdx]);
                sample.success = Boolean.parseBoolean(parts[successIdx]);

                samples.add(sample);

                totalSamples++;
                totalElapsed += sample.elapsed;
                if (!sample.success) {
                    errorCount++;
                }
            }
        }

        double avgElapsed = totalSamples > 0 ? (double) totalElapsed / totalSamples : 0;
        double errorRate = totalSamples > 0 ? (double) errorCount / totalSamples : 0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalSamples", totalSamples);
        summary.put("averageElapsed", avgElapsed);
        summary.put("errorCount", errorCount);
        summary.put("errorRate", errorRate);

        Map<String, Object> result = new HashMap<>();
        result.put("summary", summary);
        result.put("samples", samples);

        return result;
    }
}

