import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:http/http.dart' as http;
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:tehelka_testing_app/testscreen.dart';
import 'dart:io';
import "home.dart" as home;
import "history_screen.dart";
import 'project.dart';
import 'package:http_parser/http_parser.dart';



const String baseUrl = 'http://192.168.1.22:8080'; 

//
//API FOR LOGIN , SIGNUP AND FORGOT PASSWORD
//


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

Future<void> deleteProject(int id) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/api/projects/$id'),
    headers: {'Content-Type': 'application/json'},
  );
  if (response.statusCode != 200 && response.statusCode != 204) {
    throw Exception('Failed to delete project: ${response.body}');
  }
}

Future<List<TestItem>> fetchTestsForProject(int projectId) async {
  final response = await http.get(Uri.parse('$baseUrl/api/projects/$projectId/tests'));
  if (response.statusCode == 200) {
    final List data = json.decode(response.body);
    return data.map((item) => TestItem.fromJson(item)).toList();
  } else {
    throw Exception('Failed to load tests: ${response.statusCode}');
  }
}











///
///
///
///API FOR TEST PAGE
///
///
///








Future<TestItem> createTestForProject({
  required int projectId,
  required Map<String, dynamic> testRequest,
  required File file,
}) async {
  var uri = Uri.parse('$baseUrl/api/projects/$projectId/tests/create');
  var request = http.MultipartRequest('POST', uri);
  // Add JSON as a multipart file with application/json content type
  final jsonString = jsonEncode(testRequest);
  final jsonPart = http.MultipartFile.fromString(
    'test',
    jsonString,
    contentType: MediaType('application', 'json'),
  );
  request.files.add(jsonPart);
  // Add the .jmx file
  final jmxPart = await http.MultipartFile.fromPath(
    'file',
    file.path,
    contentType: MediaType('application', 'octet-stream'),
  );
  request.files.add(jmxPart);

  var streamedResponse = await request.send();
  var response = await http.Response.fromStream(streamedResponse);

  if (response.statusCode == 200 || response.statusCode == 201) {
    return TestItem.fromJson(json.decode(response.body));
  } else {
    throw Exception('Failed to create test: ${response.body}');
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

Future<void> deleteTest(int projectId, int testId) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/api/projects/$projectId/tests/$testId'),
  );
  if (response.statusCode != 200 && response.statusCode != 204) {
    throw Exception('Failed to delete test');
  }
}


Future<TestItem> fetchTestById(int projectId, int testId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/api/projects/$projectId/tests/$testId'),
  );
  if (response.statusCode == 200) {
    return TestItem.fromJson(json.decode(response.body));
  } else {
    throw Exception('Failed to fetch test');
  }
}



//
//
//
//API FOR SCHEDULED TESTS
//
//
//

class ScheduledSummary {
  final String projectName;
  final String testName;
  final DateTime createdAt;
  final DateTime scheduledExecutionTime;

  ScheduledSummary({
    required this.projectName,
    required this.testName,
    required this.createdAt,
    required this.scheduledExecutionTime,
  });

  factory ScheduledSummary.fromJson(Map<String, dynamic> json) {
    return ScheduledSummary(
      projectName: json['projectName'] ?? '',
      testName: json['testName'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      scheduledExecutionTime: json['scheduledExecutionTime'] != null
          ? DateTime.parse(json['scheduledExecutionTime'])
          : DateTime.now(),
    );
  }
}

Future<List<ScheduledSummary>> fetchScheduledTests() async {
  final response = await http.get(Uri.parse('$baseUrl/api/tests/scheduled')); 
  if (response.statusCode == 200) {
    final List data = json.decode(response.body);
    return data.map((item) => ScheduledSummary.fromJson(item)).toList();
  } else {
    throw Exception('Failed to load scheduled tests');
  }
}







//
//
//
//
//API FOR HISTORY
//
//
//
//







class CompletedTestSummary {
  final String projectName;
  final String testName;
  final DateTime createdAt;
  final DateTime scheduledExecutionTime;

  CompletedTestSummary({
    required this.projectName,
    required this.testName,
    required this.createdAt,
    required this.scheduledExecutionTime,
  });

  factory CompletedTestSummary.fromJson(Map<String, dynamic> json) {
  return CompletedTestSummary(
    projectName: json['projectName'] ?? '',
    testName: json['testName'] ?? '',
    createdAt: json['createdAt'] != null
        ? DateTime.parse(json['createdAt'])
        : DateTime.now(),
    scheduledExecutionTime: json['scheduledExecutionTime'] != null
        ? DateTime.parse(json['scheduledExecutionTime'])
        : DateTime.now(),
  );
}
}

Future<List<CompletedTestSummary>> fetchCompletedTests() async {
  final response = await http.get(Uri.parse('$baseUrl/api/tests/completed'));
  if (response.statusCode == 200) {
    final List data = json.decode(response.body);
    return data.map((item) => CompletedTestSummary.fromJson(item)).toList();
  } else {
    throw Exception('Failed to load completed tests');
  }
}

// // Download report for a test (returns file bytes)
// Future<List<int>> downloadTestReport(String testName, String projectName, String reportid) async {
//   final url = '$baseUrl/api/reports/$reportid/download');
//   final response = await http.get(Uri.parse(url));
//   if (response.statusCode == 200) {
//     return response.bodyBytes;
//   } else {
//     throw Exception('Failed to download report');
//   }
// }



