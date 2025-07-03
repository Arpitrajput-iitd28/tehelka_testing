import 'package:file_picker/file_picker.dart';

class FileInfo {
  final String name;
  final int size;
  FileInfo(this.name, this.size);

  factory FileInfo.fromJson(Map json) {
    return FileInfo(
      json['name'],
      json['size'],
    );
  }
} 

class Project {
  final String name;
  final PlatformFile? file;
  Project(this.name, {this.file});

  factory Project.fromJson(Map json) {
    return Project(json['customName'] ?? json['name'] ?? '');
  }

  Map toJson() {
    return {'customName': name};
  }
} 

class ScheduledTest {
  final String testName;
  final DateTime scheduledDateTime;

  ScheduledTest({
    required this.testName,
    required this.scheduledDateTime,
  });

  factory ScheduledTest.fromJson(Map json) {
    return ScheduledTest(
      testName: json['testName'],
      scheduledDateTime: DateTime.parse(json['scheduledDateTime']),
    );
  }
} 


