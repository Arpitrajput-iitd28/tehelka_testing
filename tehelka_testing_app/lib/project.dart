// project.dart

class Project {
  final int id;
  final String name;

  Project({required this.id, required this.name});

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
    };
  }
}

///////////////////// TEST REPORT /////////////////////
///
///
class TestReport {
  final String fileName;
  final String testName;
  final String projectName;
  final DateTime createdAt;

  TestReport({
    required this.fileName,
    required this.testName,
    required this.projectName,
    required this.createdAt,
  });

  factory TestReport.fromJson(Map<String, dynamic> json) {
    return TestReport(
      fileName: json['fileName'] ?? '',
      testName: json['testName'] ?? '',
      projectName: json['projectName'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
