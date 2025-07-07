import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'project.dart'; 
import 'dart:io';
import "home.dart" as home;
import "load_test_config_request.dart";
import "history_screen.dart";

const String baseUrl = 'http://192.168.1.17:8080'; 
//
//
//API'S FOR HOME.DART
//
//
Future<List<Project>> fetchProjects() async {
  final response = await http.get(Uri.parse('$baseUrl/api/projects'));
  if (response.statusCode == 200 || response.statusCode == 201) {
    final List data = jsonDecode(response.body);
    return data.map((json) => Project.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load projects');
  }
}
Future<Project> createProject(String title) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/projects/create'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'customName': title}),
  );
  if (response.statusCode == 200 || response.statusCode == 201) {
    return Project.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to create project: ${response.body}');
  }
}

Future<void> deleteProject(String projectName) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/api/load-tests/delete/$projectName'),
    headers: {'Content-Type': 'application/json'},
  );
  if (response.statusCode != 200 && response.statusCode != 204) {
    throw Exception('Failed to delete project: ${response.body}');
  }
}
//
//
//
Future<bool> scheduleLoadTest(LoadTestConfigRequest request) async {
  final url = Uri.parse('$baseUrl/api/load-tests/config');
  final response = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode(request.toJson()),
  );
  if (response.statusCode == 200 || response.statusCode == 201) {
    // You can parse response.body if you want to use the returned config
    return true;
  } else {
    throw Exception('Failed to schedule test: ${response.body}');
  }
}


Future<List<TestReport>> fetchAllTestReports() async {
  final response = await http.get(Uri.parse('$baseUrl/reports'));
  if (response.statusCode == 200) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => TestReport.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load reports');
  }
}

Future<void> downloadReport(String url, String fileName) async {
  final dir = await getApplicationDocumentsDirectory();
  final filePath = '${dir.path}/$fileName';
  await Dio().download(url, filePath);
  await OpenFile.open(filePath); 
}


// Fetch scheduled tests
Future<List<ScheduledTest>> fetchSchedule() async {
  final response = await http.get(Uri.parse('$baseUrl/api/load-tests/scheduled-tests'));
  if (response.statusCode == 200) {
    final List data = jsonDecode(response.body);
    return data.map((json) => ScheduledTest.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load schedule');
  }
} 

// Fetch test history/reports
Future<List<TestReport>> fetchTestReports() async {
  final response = await http.get(Uri.parse('$baseUrl/api/load-tests/report/history'));
  if (response.statusCode == 200) {
    final List data = jsonDecode(response.body);
    return data.map((json) => TestReport.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load reports');
  }
}
