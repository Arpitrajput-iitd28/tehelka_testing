import 'package:flutter/material.dart';
import 'project_service.dart'; 

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class SchedulePage extends StatefulWidget {
  const SchedulePage({Key? key}) : super(key: key);

  @override
  State<SchedulePage> createState() => _SchedulePageState();
}

class _SchedulePageState extends State<SchedulePage> {
  List<ScheduledSummary> scheduledTests = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadScheduledTests();
  }

  Future<void> _loadScheduledTests() async {
    setState(() => isLoading = true);
    try {
      final fetched = await fetchScheduledTests();
      setState(() {
        scheduledTests = fetched;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load scheduled tests: $e')),
      );
    }
  }

  String _formatDateTime(DateTime dt) {
    final date = "${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}";
    final time = "${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}";
    return "$date $time";
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
          'Scheduled Test',
          style: TextStyle(color: kBisque, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      body: SafeArea(
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : scheduledTests.isEmpty
                ? const Center(
                    child: Text(
                      'No scheduled tests.',
                      style: TextStyle(color: kBisque, fontSize: 16),
                    ),
                  )
                : ListView.builder(
                    itemCount: scheduledTests.length,
                    itemBuilder: (context, index) {
                      final test = scheduledTests[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                        decoration: BoxDecoration(
                          color: kDarkBlue,
                          gradient: const LinearGradient(colors: [Color.fromARGB(255, 69, 0, 73), Color.fromARGB(255, 9, 34, 66), Color.fromARGB(255, 0, 0, 0)],),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: kBisque, width: 2),
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
                                style: const TextStyle(color: Colors.orangeAccent, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
      ),
    );
  }
}
