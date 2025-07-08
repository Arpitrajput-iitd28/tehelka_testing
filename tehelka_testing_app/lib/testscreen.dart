import 'package:flutter/material.dart';
import 'project.dart';
import 'project_service.dart';
import 'createtest.dart';

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class TestItem {
  final int id;
  final String testName;
  final DateTime createdAt;
  final String status;

  TestItem({
    required this.id,
    required this.testName,
    required this.createdAt,
    this.status = '',
  });

  

  factory TestItem.fromJson(Map<String, dynamic> json) {
    return TestItem(
      id: json['id'] ?? 0,
      testName: json['testName'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      status: (json['status'] ?? '').toString().toUpperCase(),
    );
  }
}

class TestScreen extends StatefulWidget {
  final Project project;

  const TestScreen({Key? key, required this.project}) : super(key: key);

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  List<TestItem> tests = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTests();
  }

  Future<void> _loadTests() async {
    setState(() => isLoading = true);
    try {
      final fetched = await fetchTestsForProject(widget.project.id);
      setState(() {
        tests = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load tests: $e')),
      );
    }
  }

  Future<void> _deleteTest(int testId) async {
    try {
      await deleteTest(widget.project.id, testId);
      setState(() {
        tests.removeWhere((t) => t.id == testId);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Test deleted')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to delete test: $e')),
      );
    }
  }

  Future<void> _redoTest(int testId) async {
    try {
      final testDetails = await fetchTestById(widget.project.id, testId);
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CreateTestScreen(
            project: widget.project,
            initialTest: testDetails,
            isEditing: true,
          ),
        ),
      ).then((_) => _loadTests());
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load test: $e')),
      );
    }
  }

  String _formatDateTime(DateTime dt) {
    final date = "${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}";
    final time = "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    return "$date $time";
  }

  Color _statusColor(String status) {
    switch (status.toUpperCase()) {
      case 'RUNNING':
        return Colors.blueAccent;
      case 'COMPLETED':
        return Colors.green;
      case 'SCHEDULED':
        return Colors.orange;
      case 'FAILED':
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
        title: Text(
          'Tests for ${widget.project.name}',
          style: const TextStyle(color: kBisque, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
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
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => CreateTestScreen(
                                project: widget.project,
                                isEditing: false,
                                initialTest: null, // Now allowed since nullable
                              ),
                            ),
                          ).then((_) => _loadTests());
                        },
                        child: const Text('Create Tests'),
                      ),
                    ),
                  ),
                  const Divider(
                    thickness: 3,
                    color: kBisque,
                    height: 32,
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              Color.fromARGB(255, 61, 59, 118),
                              Color.fromARGB(255, 13, 39, 72),
                              kBlack
                            ],
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
                                                  test.testName,
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
                                                    if (test.status.isNotEmpty)
                                                      Row(
                                                        children: [
                                                          Container(
                                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                                            decoration: BoxDecoration(
                                                              color: _statusColor(test.status).withOpacity(0.16),
                                                              borderRadius: BorderRadius.circular(8),
                                                            ),
                                                            child: Text(
                                                              test.status[0].toUpperCase() +
                                                                  test.status.substring(1).toLowerCase(),
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
                                                        _redoTest(test.id);
                                                      },
                                                    ),
                                                    IconButton(
                                                      icon: const Icon(Icons.delete, color: Colors.redAccent),
                                                      tooltip: 'Delete Test',
                                                      onPressed: () {
                                                        _deleteTest(test.id);
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
