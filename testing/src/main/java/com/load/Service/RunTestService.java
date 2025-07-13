package com.load.Service;

import com.load.DTO.ReportResultDTO;
import com.load.Enums.TestRunStatus;
import com.load.Model.Report;
import com.load.Model.ReportMetric;
import com.load.Model.RunTest;
import com.load.Model.Test;
import com.load.Repository.ReportMetricRepository;
import com.load.Repository.ReportRepository;
import com.load.Repository.RunTestRepository;
import com.load.Repository.TestRepository;
import com.load.Utils.JtlParser;
import com.fasterxml.jackson.databind.ObjectMapper;


import org.springframework.stereotype.Service;
import org.w3c.dom.*;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RunTestService {

    private final TestRepository testRepository;
    private final RunTestRepository runTestRepository;
    private final ReportService reportService;
    private final ReportMetricRepository reportMetricRepository;
    private final ReportRepository reportRepository;
    private final Set<Path> downloadedCsvFiles = new HashSet<>();

    public RunTestService(TestRepository testRepository, RunTestRepository runTestRepository, ReportService reportService, ReportMetricRepository reportMetricRepository, ReportRepository reportRepository) {
        this.testRepository = testRepository;
        this.runTestRepository = runTestRepository;
        this.reportService = reportService;
        this.reportMetricRepository = reportMetricRepository;
        this.reportRepository = reportRepository;
    }

    private boolean isUrl(String path) {
        try {
            new URL(path).toURI();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private Path downloadFileFromUrl(String fileUrl) throws IOException {
        URL url = new URL(fileUrl);
        Path tempFile = Files.createTempFile("csv-", ".csv");
        try (InputStream in = url.openStream()) {
            Files.copy(in, tempFile, StandardCopyOption.REPLACE_EXISTING);
        }
        return tempFile;
    }

    private void cleanupDownloadedCsvFiles() {
        for (Path tempFile : downloadedCsvFiles) {
            try {
                Files.deleteIfExists(tempFile);
            } catch (IOException e) {
                // Log or handle error
            }
        }
        downloadedCsvFiles.clear();
    }

    private void updateJmxWithConfigAndCsv(File jmxFile, Test test) throws Exception {
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        Document doc = builder.parse(jmxFile);

        NodeList stringProps = doc.getElementsByTagName("stringProp");
        for (int i = 0; i < stringProps.getLength(); i++) {
            Element element = (Element) stringProps.item(i);
            String name = element.getAttribute("name");
            switch (name) {
                case "ThreadGroup.num_threads":
                    if (test.getNumUsers() != null)
                        element.setTextContent(String.valueOf(test.getNumUsers()));
                    break;
                case "ThreadGroup.ramp_time":
                    if (test.getRampUpPeriod() != null)
                        element.setTextContent(String.valueOf(test.getRampUpPeriod()));
                    break;
                case "LoopController.loops":
                    if (test.getLoop() != null)
                        element.setTextContent(String.valueOf(test.getLoop()));
                    break;
                case "ThreadGroup.duration":
                    if (test.getTestDuration() != null)
                        element.setTextContent(String.valueOf(test.getTestDuration()));
                    break;
                case "ThreadGroup.delay":
                    if (test.getStartdelay() != null)
                        element.setTextContent(String.valueOf(test.getStartdelay()));
                    break;
                case "ThreadGroup.start_time":
                    if (test.getStartupTime() != null)
                        element.setTextContent(String.valueOf(test.getStartupTime()));
                    break;
                case "ThreadGroup.hold":
                    if (test.getHoldLoadFor() != null)
                        element.setTextContent(String.valueOf(test.getHoldLoadFor()));
                    break;
                case "ThreadGroup.shutdown_time":
                    if (test.getShutdownTime() != null)
                        element.setTextContent(String.valueOf(test.getShutdownTime()));
                    break;
                case "ThreadGroup.start_threads":
                    if (test.getStartThreadCount() != null)
                        element.setTextContent(String.valueOf(test.getStartThreadCount()));
                    break;
                case "ThreadGroup.initial_delay":
                    if (test.getInitialDelay() != null)
                        element.setTextContent(String.valueOf(test.getInitialDelay()));
                    break;
                // Add more cases as needed for other thread properties
            }
            // Handle CSV file references
            if ("filename".equals(name)) {
                String csvPath = element.getTextContent();
                if (isUrl(csvPath)) {
                    Path localCsv = downloadFileFromUrl(csvPath);
                    element.setTextContent(localCsv.toAbsolutePath().toString());
                    downloadedCsvFiles.add(localCsv);
                }
                // else: local path, leave as is
            }
        }

        // Write the updated XML back to file
        Transformer transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        DOMSource source = new DOMSource(doc);
        StreamResult result = new StreamResult(jmxFile);
        transformer.transform(source, result);
    }

    public ReportResultDTO runTest(Long testId) throws Exception {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test not found with id: " + testId));

    
        test.setTestRunStatus(TestRunStatus.RUNNING);
        testRepository.save(test);

        RunTest runTest = new RunTest();
        runTest.setTest(test);
        runTest.setStartedAt(LocalDateTime.now());
        runTest = runTestRepository.save(runTest);

        Path tempJmxPath = Files.createTempFile("testplan-", ".jmx");
        Files.write(tempJmxPath, test.getJmxFileData());

        // Update JMX with config and CSV handling
        updateJmxWithConfigAndCsv(tempJmxPath.toFile(), test);

        Path resultPath = Files.createTempFile("jmeter-result-", ".jtl");
        System.out.println("JTL file path: " + resultPath.toAbsolutePath());
        List<String> command = new ArrayList<>();
        command.add("/Users/snehasishbala/Downloads/apache-jmeter-5.6.3/bin/jmeter");
        command.add("-n");
        command.add("-t");
        command.add(tempJmxPath.toAbsolutePath().toString());
        command.add("-l");
        command.add(resultPath.toAbsolutePath().toString());
        command.add("-f");
        command.add("-Jjmeter.save.saveservice.print_field_names=true");


        ProcessBuilder pb = new ProcessBuilder(command);
        pb.redirectErrorStream(true);
        Process process = pb.start();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        }

        int exitCode = process.waitFor();

        // Always clean up downloaded CSVs
        cleanupDownloadedCsvFiles();

        // Update runTest status and details
        runTest.setFinishedAt(LocalDateTime.now());
        runTest.setResultFilePath(resultPath.toAbsolutePath().toString());
        Report report=null;
        if (exitCode == 0) {
            test.setTestRunStatus(TestRunStatus.COMPLETED);
            Map<String, Object> jtlData = JtlParser.parseJtl(resultPath);
            ObjectMapper objectMapper = new ObjectMapper();
            String summaryJson = objectMapper.writeValueAsString(jtlData.get("summary"));
            String detailsJson = objectMapper.writeValueAsString(jtlData.get("samples"));
            String graphsJson = null;
        
            // 1. Create and save the Report FIRST (with minimal info)
            report = new Report();
            report.setProjectId(test.getProject().getId());
            report.setTestRunId(runTest.getId());
            report.setGeneratedAt(LocalDateTime.now());
            report.setSummaryJson(summaryJson);
            report.setDetailsJson(detailsJson);
            report.setGraphsJson(graphsJson);
            // Don't set htmlReportContent/excelReportPath yet
            report = reportRepository.save(report);; // <-- You may need to expose getReportRepository() in ReportService, or inject ReportRepository here
        
            // 2. Aggregate metrics and set the report on each metric
            Map<String, List<JtlParser.Sample>> samplesByLabel = new HashMap<>();
            for (JtlParser.Sample sample : (List<JtlParser.Sample>) jtlData.get("samples")) {
                samplesByLabel.computeIfAbsent(sample.label, k -> new ArrayList<>()).add(sample);
            }
        
            List<ReportMetric> metrics = new ArrayList<>();
            for (Map.Entry<String, List<JtlParser.Sample>> entry : samplesByLabel.entrySet()) {
                String label = entry.getKey();
                List<JtlParser.Sample> group = entry.getValue();
        
                int count = group.size();
                double avg = group.stream().mapToLong(s -> s.elapsed).average().orElse(0);
                double min = group.stream().mapToLong(s -> s.elapsed).min().orElse(0);
                double max = group.stream().mapToLong(s -> s.elapsed).max().orElse(0);
                double stddev = Math.sqrt(group.stream().mapToDouble(s -> Math.pow(s.elapsed - avg, 2)).average().orElse(0));
                long errorCount = group.stream().filter(s -> !s.success).count();
                double errorPct = count > 0 ? (double) errorCount * 100 / count : 0;
        
                ReportMetric metric = new ReportMetric();
                metric.setReport(report); // <-- Now report is NOT null!
                metric.setLabel(label);
                metric.setSamples(count);
                metric.setAverage(avg);
                metric.setMin(min);
                metric.setMax(max);
                metric.setStdDev(stddev);
                metric.setErrorPct(errorPct);
                // Throughput, receivedKbSec, sentKbSec can be set if you have data
        
                metrics.add(metric);
            }
        
            // 3. Save all metrics to DB
            reportMetricRepository.saveAll(metrics);
        
            // 4. Generate Excel report
            String excelReportPath = reportService.generateExcelReport(
                    report.getId(),
                  
                    summaryJson,
                    detailsJson,
                    graphsJson
                );
        
            // 5. Update the report with the Excel path
            report.setHtmlReportContent(excelReportPath);
            report =reportRepository.save(report);;
        
        } else {
            test.setTestRunStatus(TestRunStatus.FAILED);
            runTest.setErrorMessage("JMeter execution failed with exit code " + exitCode);
        }
        
        return new ReportResultDTO(report.getId(), report.getHtmlReportContent());
    }
}
