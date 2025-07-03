class LoadTestConfigRequest {
  final String testName;
  final String targetUrl;
  final int numUsers;
  final int rampUpPeriod;
  final int testDuration;
  final String crudType ;
  final DateTime scheduledExecutionTime; 

  LoadTestConfigRequest({
    required this.testName,
    required this.targetUrl,
    required this.numUsers,
    required this.rampUpPeriod,
    required this.testDuration,
    required this.scheduledExecutionTime,
    required this.crudType,
  });

  Map<String, dynamic> toJson() => {
        'testName': testName,
        'targetUrl': targetUrl,
        'numUsers': numUsers,
        'rampUpPeriod': rampUpPeriod,
        'testDuration': testDuration,
        'scheduledExecutionTime': scheduledExecutionTime,
        'crudType': crudType,
      };
}
