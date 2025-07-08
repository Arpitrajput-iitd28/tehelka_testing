import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'project.dart'; 
import 'dart:io';
import "home.dart" as home;
import "history_screen.dart";

const String baseUrl = 'http://192.168.1.17:8080'; 
//API FOR LOGIN , SIGNUP AND FORGOT PASSWORD

Future<bool> loginUser(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email, 'password': password}),
  );
  if (response.statusCode == 200) {
    // Optionally parse and store token/user info here
    return true;
  } else {
    // Optionally, parse error message from response.body
    return false;
  }
}

Future<bool> registerUser({
  required String email,
  required String name,
  required String password,
  required String confirmPassword,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/signup'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'name': name,
      'password': password,
      'confirmPassword': confirmPassword,
    }),
  );
  return response.statusCode == 200 || response.statusCode == 201;
}

Future<bool> resetPassword(String email) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/forgot-password'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'email': email}),
  );
  return response.statusCode == 200 || response.statusCode == 201;
}
///
/// API'S FOR HOME.DART
///
///
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
    body: jsonEncode({'name': title}),
  );
  if (response.statusCode == 200 || response.statusCode == 201) {
    return Project.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to create project: ${response.body}');
  }
}

Future<void> deleteProject(String projectName) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/api/projects/delete/$projectName'),
    headers: {'Content-Type': 'application/json'},
  );
  if (response.statusCode != 200 && response.statusCode != 204) {
    throw Exception('Failed to delete project: ${response.body}');
  }
}

Future<void> startTest(String projectName) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/load-tests/start'), // Replace with your endpoint
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'projectName': projectName}),
  );
  if (response.statusCode != 200 && response.statusCode != 201) {
    throw Exception('Failed to start test: ${response.body}');
  }
}
//
//
//
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
// Fetch test schedule

Future<List<ScheduledTest>> fetchSchedule() async {
  final response = await http.get(Uri.parse('$baseUrl/api/load-tests/schedule'));
  if (response.statusCode == 200) {
    final List data = jsonDecode(response.body);
    return data.map((json) => ScheduledTest.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load schedule');
  }
}