package com.load.Service;

import com.load.Enums.TestRunStatus;
import com.load.Model.RunTest;
import com.load.Model.Test;
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
    private final Set<Path> downloadedCsvFiles = new HashSet<>();

    public RunTestService(TestRepository testRepository, RunTestRepository runTestRepository, ReportService reportService) {
        this.testRepository = testRepository;
        this.runTestRepository = runTestRepository;
        this.reportService = reportService;
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

    public String runTest(Long testId) throws Exception {
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

        List<String> command = new ArrayList<>();
        command.add("/Users/snehasishbala/Downloads/apache-jmeter-5.6.3/bin/jmeter");
        command.add("-n");
        command.add("-t");
        command.add(tempJmxPath.toAbsolutePath().toString());
        command.add("-l");
        command.add(resultPath.toAbsolutePath().toString());

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
        if (exitCode == 0) {
            test.setTestRunStatus(TestRunStatus.COMPLETED);
            Map<String, Object> jtlData = JtlParser.parseJtl(resultPath);
        ObjectMapper objectMapper = new ObjectMapper();
        String summaryJson = objectMapper.writeValueAsString(jtlData.get("summary"));
        String detailsJson = objectMapper.writeValueAsString(jtlData.get("samples"));
        String graphsJson = null; 

        String excelReportPath = reportService.generateExcelReport(
                test.getProject().getId(),
                runTest.getId(),
                summaryJson,
                detailsJson,
                graphsJson
            );

            
        reportService.createReport(
            test.getProject().getId(),
            runTest.getId(),
            summaryJson,
            detailsJson,
            graphsJson,
            null 
        );
        } else {
            test.setTestRunStatus(TestRunStatus.FAILED);
            runTest.setErrorMessage("JMeter execution failed with exit code " + exitCode);
        }
        runTestRepository.save(runTest);
        testRepository.save(test);

        if (exitCode != 0) {
            throw new RuntimeException("JMeter execution failed with exit code " + exitCode);
        }

        return resultPath.toAbsolutePath().toString();
    }
}
