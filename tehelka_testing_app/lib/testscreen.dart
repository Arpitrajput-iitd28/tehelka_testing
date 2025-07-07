import 'package:flutter/material.dart';
import 'package:tehelka_testing_app/home.dart';
import 'createtest.dart';

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class TestItem {
  final String title;
  final DateTime createdAt;
  final String status; // "running", "completed", "scheduled", "failed"

  TestItem({
    required this.title,
    required this.createdAt,
    required this.status,
  });
}

class TestScreen extends StatefulWidget {
  const TestScreen({Key? key, required Project project}) : super(key: key);

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  List<TestItem> tests = [
    TestItem(title: 'Login API Test', createdAt: DateTime.now().subtract(const Duration(minutes: 10)), status: 'COMPLETED'),
    TestItem(title: 'File Upload Stress', createdAt: DateTime.now().subtract(const Duration(hours: 1, minutes: 5)), status: 'RUNNING'),
    TestItem(title: 'Signup Endpoint', createdAt: DateTime.now().subtract(const Duration(days: 1, hours: 2)), status: 'SCHEDULED'),
    TestItem(title: 'PDF Download Test', createdAt: DateTime.now().subtract(const Duration(days: 2)), status: 'FAILED'),
  ];

  void _openCreateTestPage() async {
    final result = await Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const CreatePage()),
    );
    if (result != null && result is Map && result['test'] != null) {
      setState(() {
        tests.add(result['test'] as TestItem);
      });
    }
  }

  String _formatDateTime(DateTime dt) {
    final date = "${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}";
    final time = "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    return "$date $time";
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'running':
        return Colors.blueAccent;
      case 'completed':
        return Colors.green;
      case 'scheduled':
        return Colors.orange;
      case 'failed':
        return Colors.redAccent;
      default:
        return kBisque;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      appBar: AppBar(
        backgroundColor: kBlack,
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Tests',
          style: TextStyle(color: kBisque, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Create Tests Button
            Padding(
              padding: const EdgeInsets.only(top: 20, bottom: 12),
              child: Center(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kBisque,
                    foregroundColor: kDarkBlue,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  onPressed: _openCreateTestPage,
                  child: const Text('Create Tests'),
                ),
              ),
            ),
            // Divider
            const Divider(
              thickness: 3,
              color: kBisque,
              height: 32,
            ),
            // Tests Card (floating, scrollable, gradient, shadow)
            Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color.fromARGB(255, 61, 59, 118), Color.fromARGB(255, 13, 39, 72), kBlack],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: kBisque.withOpacity(0.18),
                        blurRadius: 24,
                        offset: const Offset(0, 12),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(left: 8, bottom: 8),
                          child: Text(
                            "All Tests",
                            style: TextStyle(
                              color: kBisque,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Expanded(
                          child: tests.isEmpty
                              ? const Center(
                                  child: Text(
                                    'No tests yet.',
                                    style: TextStyle(color: kBisque, fontSize: 16),
                                  ),
                                )
                              : Scrollbar(
                                  child: ListView.builder(
                                    itemCount: tests.length,
                                    itemBuilder: (context, index) {
                                      final test = tests[index];
                                      return Container(
                                        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                                        decoration: BoxDecoration(
                                          color: kDarkBlue,
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border.all(
                                            color: kBisque,
                                            width: 2,
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
                                            test.title,
                                            style: const TextStyle(
                                                color: kBisque, fontWeight: FontWeight.w600),
                                          ),
                                          subtitle: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                "Created: ${_formatDateTime(test.createdAt)}",
                                                style: const TextStyle(
                                                    color: Colors.white70, fontSize: 13),
                                              ),
                                              const SizedBox(height: 2),
                                              Row(
                                                children: [
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                    decoration: BoxDecoration(
                                                      color: _statusColor(test.status).withOpacity(0.16),
                                                      borderRadius: BorderRadius.circular(8),
                                                    ),
                                                    child: Text(
                                                      test.status[0].toUpperCase() + test.status.substring(1),
                                                      style: TextStyle(
                                                        color: _statusColor(test.status),
                                                        fontWeight: FontWeight.bold,
                                                        fontSize: 13,
                                                      ),
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ],
                                          ),
                                          trailing: Row(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              IconButton(
                                                icon: const Icon(Icons.redo, color: kBisque),
                                                tooltip: 'Redo Test',
                                                onPressed: () {
                                                  // Add redo functionality later
                                                },
                                              ),
                                              IconButton(
                                                icon: const Icon(Icons.delete, color: Colors.redAccent),
                                                tooltip: 'Delete Test',
                                                onPressed: () {
                                                  // Add delete functionality later
                                                },
                                              ),
                                            ],
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
