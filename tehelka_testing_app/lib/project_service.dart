import 'dart:convert';
import 'package:http/http.dart' as http;
import 'project.dart'; // Your Project model

const String baseUrl = 'http://192.168.1.17:8080'; // Replace with your API base URL

Future<List<Project>> fetchProjects() async {
  final response = await http.get(Uri.parse('$baseUrl/api/load-tests/uploads'));
  if (response.statusCode == 200) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => Project.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load projects');
  }
}

Future<Project> createProject(String title, String? filePath) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/load-tests/upload'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({'name': title, 'filePath': filePath}),
  );
  if (response.statusCode == 201) {
    return Project.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to create project');
  }
}
