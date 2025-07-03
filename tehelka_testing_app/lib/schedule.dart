import 'package:flutter/material.dart';
import 'project_service.dart'; // Make sure this contains fetchSchedule()
import 'project.dart'; // For ScheduledTest model

const Color kNavyBlue = Color(0xFF0A183D);
const Color kCardColor = Color(0xFF162447);
const Color kAccentColor = Color(0xFF1F4068);

class ScheduleScreen extends StatefulWidget {
  const ScheduleScreen({Key? key}) : super(key: key);

  @override
  State<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends State<ScheduleScreen> {
  late Future<List<ScheduledTest>> _scheduleFuture;

  @override
  void initState() {
    super.initState();
    _scheduleFuture = fetchSchedule().then((value) => value.cast<ScheduledTest>());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kNavyBlue,
      appBar: AppBar(
        backgroundColor: kNavyBlue,
        title: const Text('Scheduled Tests', style: TextStyle(color: Colors.white)),
      ),
      body: FutureBuilder<List<ScheduledTest>>(
        future: _scheduleFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: kAccentColor));
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: TextStyle(color: Colors.red)));
          }
          final schedule = snapshot.data ?? [];
          if (schedule.isEmpty) {
            return const Center(
              child: Text('No tests scheduled.', style: TextStyle(color: Colors.white70, fontSize: 16)),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: schedule.length,
            itemBuilder: (context, index) {
              final sched = schedule[index];
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


