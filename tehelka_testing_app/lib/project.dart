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
    return Project(json['name'] ?? '');
  }

  Map toJson() {
    return {'name': name};
  }
} 

class ScheduledTest {
  final String testName;
  final DateTime scheduledDateTime;
  final int id ;
  final String targetUrl;
  final int numUsers;
  final int rampUpPeriod;
  final int testDuration;
  final String crudType;
  final bool scheduled ;
  final String createdAt; 

  ScheduledTest({
    required this.testName,
    required this.scheduledDateTime,
    required this.id,
    required this.targetUrl,
    required this.numUsers,
    required this.rampUpPeriod,
    required this.testDuration,
    required this.crudType,
    required this.createdAt,
    this.scheduled = false,
  });

  factory ScheduledTest.fromJson(Map json) {
    return ScheduledTest(
      testName: json['testName'] ?? '',
      scheduledDateTime: DateTime.parse(json['scheduledExecutionTime']),
      id: json['id'] ?? 0,
      targetUrl: json['targetUrl'] ?? '',
      numUsers: json['numUsers'] ?? 0,
      rampUpPeriod: json['rampUpPeriod'] ?? 0,
      testDuration: json['testDuration'] ?? 0,
      crudType: json['crudType'] ?? '',
      createdAt: json['createdAt'] ?? '',
      scheduled: json['scheduled'] ?? false,
    );
  }
} 
