import 'package:flutter/material.dart';
import 'home.dart'; // For ScheduledTest and color constants

class ScheduleScreen extends StatelessWidget {
  final List<ScheduledTest> scheduledTests;

  const ScheduleScreen({Key? key, required this.scheduledTests}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kNavyBlue,
      appBar: AppBar(
        backgroundColor: kNavyBlue,
        title: const Text('Scheduled Tests', style: TextStyle(color: Colors.white)),
      ),
      body: scheduledTests.isEmpty
          ? const Center(
              child: Text(
                'No tests scheduled.',
                style: TextStyle(color: Colors.white70, fontSize: 16),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: scheduledTests.length,
              itemBuilder: (context, index) {
                final sched = scheduledTests[index];
                return Card(
                  color: kCardColor,
                  margin: const EdgeInsets.symmetric(vertical: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.timer, color: Colors.white),
                    title: Text(
                      sched.testName,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      'Scheduled at: ${_formatDateTime(context, sched.scheduledDateTime)}',
                      style: const TextStyle(color: Colors.white70),
                    ),
                  ),
                );
              },
            ),
    );
  }

  String _formatDateTime(BuildContext context, DateTime dt) {
    final date = "${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}";
    final time = TimeOfDay.fromDateTime(dt).format(context);
    return "$date at $time";
  }
}
