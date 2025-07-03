class LoadTestConfigRequest {
  final String fileName;
  final String targetUrl;
  final int numUsers;
  final int rampUpPeriod;
  final int testDuration;
  final String crudType ;
  final String scheduledExecutionTime; 

  LoadTestConfigRequest({
    required this.fileName,
    required this.targetUrl,
    required this.numUsers,
    required this.rampUpPeriod,
    required this.testDuration,
    required this.scheduledExecutionTime,
    required this.crudType,
  });

  Map<String, dynamic> toJson() => {
        'testName': fileName,
        'targetUrl': targetUrl,
        'numUsers': numUsers,
        'rampUpPeriod': rampUpPeriod,
        'testDuration': testDuration,
        'scheduledExecutionTime': scheduledExecutionTime,
        'crudType': crudType,
      };
}
