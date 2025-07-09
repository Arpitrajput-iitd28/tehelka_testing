import 'package:flutter/material.dart';
import 'project_service.dart'; // For CompletedTestSummary, fetchCompletedTests, downloadTestReport
import 'package:path_provider/path_provider.dart';
import 'package:open_file/open_file.dart';
import 'dart:io';

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class HistoryPage extends StatefulWidget {
  const HistoryPage({Key? key}) : super(key: key);

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  List<CompletedTestSummary> completedTests = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCompletedTests();
  }

  Future<void> _loadCompletedTests() async {
    setState(() => isLoading = true);
    try {
      final fetched = await fetchCompletedTests();
      setState(() {
        completedTests = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load completed tests: $e')),
      );
    }
  }

  String _formatDateTime(DateTime dt) {
    final date = "${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}";
    final time = "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    return "$date $time";
  }

  // Future<void> _downloadReport(CompletedTestSummary test) async {
  //   try {
  //     final bytes = await downloadTestReport(test.testName, test.projectName);
  //     final directory = await getApplicationDocumentsDirectory();
  //     final filePath = '${directory.path}/${test.projectName}_${test.testName}.pdf';
  //     final file = File(filePath);
  //     await file.writeAsBytes(bytes);
  //     await OpenFile.open(filePath);
  //     ScaffoldMessenger.of(context).showSnackBar(
  //       SnackBar(content: Text('Report downloaded: ${filePath}')),
  //     );
  //   } catch (e) {
  //     ScaffoldMessenger.of(context).showSnackBar(
  //       SnackBar(content: Text('Failed to download report: $e')),
  //     );
  //   }
  // }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      appBar: AppBar(
        backgroundColor: kBlack,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'History',
          style: TextStyle(color: kBisque, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : completedTests.isEmpty
                ? const Center(
                    child: Text(
                      'No completed tests.',
                      style: TextStyle(color: kBisque, fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    itemCount: completedTests.length,
                    itemBuilder: (context, index) {
                      final test = completedTests[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        decoration: BoxDecoration(
                          color: kDarkBlue,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kBisque, width: 2),
                          gradient: const LinearGradient(
                            colors: [Color.fromARGB(255, 69, 0, 73), Color.fromARGB(255, 9, 34, 66), Color.fromARGB(255, 0, 0, 0)],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: kBisque.withOpacity(0.10),
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ListTile(
                          title: Text(
                            test.testName,
                            style: const TextStyle(
                                color: kBisque, fontWeight: FontWeight.bold, fontSize: 18),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "Project: ${test.projectName}",
                                style: const TextStyle(color: Colors.white70, fontSize: 14),
                              ),
                              Text(
                                "Created: ${_formatDateTime(test.createdAt)}",
                                style: const TextStyle(color: Colors.white70, fontSize: 13),
                              ),
                              Text(
                                "Scheduled: ${_formatDateTime(test.scheduledExecutionTime)}",
                                    style: const TextStyle(color: Color.fromARGB(255, 0, 150, 3), fontSize: 13),
                                  ),
                            ],
                          ),
                          trailing: IconButton(
                            icon: const Icon(Icons.download, color: kBisque),
                            tooltip: 'Download Report',
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(content: Text('Download not available yet.')),
                              );
                            },
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
