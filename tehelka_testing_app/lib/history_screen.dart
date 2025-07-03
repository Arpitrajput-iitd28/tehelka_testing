// lib/history_screen.dart

import 'package:flutter/material.dart';
import 'project_service.dart';

const Color kNavyBlue = Color(0xFF0A183D);
const Color kCardColor = Color(0xFF162447);
const Color kAccentColor = Color(0xFF1F4068);

class TestReport {
  final int id;
  final String title;
  final DateTime dateTime;
  final String pdfUrl;

  TestReport({
    required this.id,
    required this.title,
    required this.dateTime,
    required this.pdfUrl,
  });

  factory TestReport.fromJson(Map<String, dynamic> json) {
    return TestReport(
      id: json['id'],
      title: json['title'],
      dateTime: DateTime.parse(json['dateTime']),
      pdfUrl: json['pdfUrl'],
    );
  }
}

class HistoryScreen extends StatefulWidget {
  @override
  _HistoryScreenState createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  late Future<List<TestReport>> _reportsFuture;

  @override
  void initState() {
    super.initState();
    _reportsFuture = fetchTestReports();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kNavyBlue,
      appBar: AppBar(
        backgroundColor: kNavyBlue,
        title: const Text('Test History', style: TextStyle(color: Colors.white)),
      ),
      body: FutureBuilder<List<TestReport>>(
        future: _reportsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: kAccentColor));
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.red)));
          }
          final reports = snapshot.data ?? [];
          if (reports.isEmpty) {
            return const Center(child: Text('No reports available.', style: TextStyle(color: Colors.white70)));
          }
          return ListView.separated(
            itemCount: reports.length,
            separatorBuilder: (_, __) => const Divider(color: kAccentColor),
            itemBuilder: (context, index) {
              final report = reports[index];
              return ListTile(
                title: Text(report.title, style: const TextStyle(color: Colors.white)),
                subtitle: Text(
                  '${report.dateTime.toLocal()}',
                  style: const TextStyle(color: Colors.white70),
                ),
                trailing: IconButton(
                  icon: const Icon(Icons.download, color: Colors.white),
                  onPressed: () => downloadReport(report.pdfUrl, 'report_${report.id}.pdf'),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
