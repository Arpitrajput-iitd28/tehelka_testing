// lib/project.dart

import 'package:file_picker/file_picker.dart';

class Project {
  final String name;
  final PlatformFile? file; // Only used for local file picking (optional)
  // Add more fields if your backend returns them, e.g.:
  // final int? id;
  // final String? filePath;

  Project(this.name, {this.file});

  // For API integration: create a Project from JSON
  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      json['name'],
      // file: null, // API does not provide PlatformFile
      // id: json['id'], // Uncomment if your API returns an id
      // filePath: json['filePath'], // Uncomment if your API returns filePath
    );
  }

  // For sending data to the API (if needed)
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      // 'id': id, // Uncomment if needed
      // 'filePath': filePath, // Uncomment if needed
    };
  }
}
