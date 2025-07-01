import 'package:file_picker/file_picker.dart';

class FileInfo {
  final String name;
  final int size;

  FileInfo(this.name, this.size);

  factory FileInfo.fromJson(Map<String, dynamic> json) {
    return FileInfo(
      json['name'],
      json['size'],
    );
  }
}

class Project {
  final String name;
  final PlatformFile? file; // Only for local files

  Project(this.name, {this.file});

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(json['name']);
  }

  Map<String, dynamic> toJson() {
    return {'name': name};
  }
}
