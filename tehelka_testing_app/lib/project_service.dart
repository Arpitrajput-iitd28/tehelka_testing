import 'dart:convert';
import 'package:http/http.dart' as http;
import 'project.dart'; // Your Project model
import 'dart:io';
import "home.dart";

const String baseUrl = 'http://192.168.1.17:8080'; // Replace with your API base URL

Future<List<Project>> fetchProjects() async {
  final response = await http.get(Uri.parse('$baseUrl/api/load-tests/uploads'));
  if (response.statusCode == 200 || response.statusCode == 201) {
    final List<dynamic> data = jsonDecode(response.body);
    return data.map((json) => Project.fromJson(json)).toList();
  } else {
    throw Exception('Failed to load projects');
  }
}


Future<Project> createProject(String title, String filePath) async {
  var uri = Uri.parse('$baseUrl/api/load-tests/upload');
  var request = http.MultipartRequest('POST', uri);

  // Add the file
  request.files.add(await http.MultipartFile.fromPath('file', filePath));

  // Add the custom name
  request.fields['customName'] = title;

  // Send the request
  var streamedResponse = await request.send();
  var response = await http.Response.fromStream(streamedResponse);

  if (response.statusCode == 200 || response.statusCode == 201) {
    fetchProjects(); 
    // Adjust according to your backend's response
    return Project.fromJson(jsonDecode(response.body));
  } else {
    throw Exception('Failed to create project: ${response.body}');
}
}
