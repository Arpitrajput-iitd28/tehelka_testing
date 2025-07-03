import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'project_service.dart';
import 'project.dart';
import 'load_test_config_request.dart';
import 'history_screen.dart';
import 'schedule.dart';

const Color kNavyBlue = Color(0xFF0A183D);
const Color kCardColor = Color(0xFF162447);
const Color kAccentColor = Color(0xFF1F4068);
const Color kButtonColor = Color(0xFF324A7D);

class ScheduledTest {
  final String testName;
  final DateTime scheduledDateTime;
  final Map<String, dynamic> parameters;

  ScheduledTest({
    required this.testName,
    required this.scheduledDateTime,
    required this.parameters,
  });
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Project> projects = [];
  final List<ScheduledTest> scheduledTests = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    setState(() {
      isLoading = true;
      error = null;
    });
    try {
      projects = await fetchProjects();
      setState(() {
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = e.toString();
        isLoading = false;
      });
    }
  }

  Future<void> _scheduleTest(Project project, Map<String, dynamic> params, DateTime scheduledDateTime) async {
  // Build your request object
  final configRequest = LoadTestConfigRequest(
    // testName: '', // leave empty, backend will generate
    targetUrl: params['Target URL'] ?? '',
    numUsers: int.tryParse(params['Users'] ?? '') ?? 0,
    rampUpPeriod: int.tryParse(params['Ramp-up Period (sec)'] ?? '') ?? 0,
    testDuration: int.tryParse(params['Test Period (min)'] ?? '') ?? 0,
    scheduledExecutionTime: scheduledDateTime.toIso8601String(),
    crudType: params['Operation'] ?? 'READ',
    fileName: project.name, // <-- ADD THIS FIELD
  );
  await scheduleLoadTest(configRequest);
}

  Future<void> _addProject(String title, PlatformFile? pickedFile) async {
    try {
      final newProject = await createProject(title, pickedFile?.path ?? '');
      setState(() {
        projects.add(newProject);
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Project "$title" created!')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to create project: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kNavyBlue,
      appBar: AppBar(
        backgroundColor: kNavyBlue,
        elevation: 0,
        title: const Text(
          'Tehelka Testing',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: kAccentColor))
          : error != null
              ? Center(child: Text('Error: $error', style: const TextStyle(color: Colors.red)))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Row of buttons
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _navButton(Icons.history, 'History', _openHistory),
                          _navButton(Icons.add_circle, 'Create', _showCreateDialog),
                        ],
                      ),
                    ),
                    // Thick divider
                    const Divider(
                      thickness: 4,
                      color: kAccentColor,
                      height: 24,
                    ),
                    // Schedule Button (centered, prominent)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      child: Center(
                        child: ElevatedButton.icon(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: kAccentColor,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                          ),
                          icon: const Icon(Icons.schedule),
                          label: const Text('Schedule'),
                          onPressed: _openSchedule,
                        ),
                      ),
                    ),
                    // Project List Container (taller and scrollable)
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                        child: Container(
                          decoration: BoxDecoration(
                            color: kCardColor,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.15),
                                blurRadius: 18,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Padding(
                                  padding: EdgeInsets.only(left: 8, bottom: 8),
                                  child: Text(
                                    "Projects",
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: ListView.builder(
                                    itemCount: projects.length,
                                    itemBuilder: (context, index) {
                                      final project = projects[index];
                                      return Card(
                                        color: kButtonColor,
                                        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                                        elevation: 0,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                        child: ListTile(
                                          title: Text(
                                            project.name,
                                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                          ),
                                          subtitle: project.file != null
                                              ? Text(
                                                  project.file!.name,
                                                  style: const TextStyle(color: Colors.white70, fontSize: 13),
                                                )
                                              : null,
                                          trailing: ElevatedButton(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: kAccentColor,
                                              foregroundColor: Colors.white,
                                              shape: RoundedRectangleBorder(
                                                borderRadius: BorderRadius.circular(8),
                                              ),
                                            ),
                                            child: const Text('Test'),
                                            onPressed: () => _showParameterPrompt(project),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _navButton(IconData icon, String label, VoidCallback onPressed) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: kButtonColor,
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        elevation: 2,
      ),
      icon: Icon(icon, size: 22),
      label: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
      onPressed: onPressed,
    );
  }

  void _showCreateDialog() {
    String? title;
    PlatformFile? pickedFile;

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: kCardColor,
              title: const Text('Create New Project', style: TextStyle(color: Colors.white)),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Project Title',
                      labelStyle: TextStyle(color: Colors.white70),
                      enabledBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.white24),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderSide: BorderSide(color: Colors.white),
                      ),
                      fillColor: kAccentColor,
                      filled: true,
                    ),
                    onChanged: (val) => title = val,
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton.icon(
                    icon: const Icon(Icons.attach_file),
                    label: Text(pickedFile == null ? "Choose File" : pickedFile!.name),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kAccentColor,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () async {
                      FilePickerResult? result = await FilePicker.platform.pickFiles(
                        type: FileType.custom,
                        allowedExtensions: ['csv', 'json', 'pdf'],
                      );
                      if (result != null && result.files.isNotEmpty) {
                        setStateDialog(() {
                          pickedFile = result.files.first;
                        });
                      }
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  child: const Text('Create', style: TextStyle(color: Colors.white)),
                  onPressed: () {
                    if (title != null && title!.trim().isNotEmpty) {
                      Navigator.of(context).pop();
                      _addProject(title!.trim(), pickedFile);
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter a title.')),
                      );
                    }
                  },
                ),
                TextButton(
                  child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            );
          },
        );
      },
    );
  }

  void _openHistory() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => HistoryScreen()));
  }

  void _openSchedule() {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => ScheduleScreen(scheduledTests: scheduledTests),
    ));
  }

  void _showParameterPrompt(Project project) {
    showDialog(
      context: context,
      builder: (context) => _ParameterPromptDialog(
        project: project,
        onRun: (DateTime scheduledDateTime, Map<String, dynamic> params) async {
          await _scheduleTest(project, params, scheduledDateTime);
        },
      ),
    );
  }

  void _showScheduledTestInfo(ScheduledTest sched) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: kCardColor,
        title: Text(
          'Test Details: ${sched.testName}',
          style: const TextStyle(color: Colors.white),
        ),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Scheduled for: ${_formatDateTime(sched.scheduledDateTime)}',
                  style: const TextStyle(color: Colors.white70)),
              const SizedBox(height: 12),
              ...sched.parameters.entries.map((e) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      "${e.key}: ${e.value}",
                      style: const TextStyle(color: Colors.white),
                    ),
                  )),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  String _formatDateTime(DateTime dt) {
    final date = "${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}";
    final time = TimeOfDay.fromDateTime(dt).format(context);
    return "$date at $time";
  }
}

class _ParameterPromptDialog extends StatefulWidget {
  final Project project;
  final Function(DateTime scheduledDateTime, Map<String, dynamic> params) onRun;
  const _ParameterPromptDialog({required this.project, required this.onRun});

  @override
  State<_ParameterPromptDialog> createState() => _ParameterPromptDialogState();
}

class _ParameterPromptDialogState extends State<_ParameterPromptDialog> {
  final TextEditingController usersController = TextEditingController();
  final TextEditingController urlController = TextEditingController();
  final TextEditingController rampUpController = TextEditingController();
  final TextEditingController testPeriodController = TextEditingController();
  final TextEditingController loopController = TextEditingController();
  final TextEditingController assertionController = TextEditingController();
  final TextEditingController testDataController = TextEditingController();

  DateTime? scheduledDate;
  TimeOfDay? scheduledTime;
  bool showAdvanced = false;

  final List<String> crudOptions = ['Create', 'Read', 'Update', 'Delete'];
  String selectedCrud = 'Read';

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: kCardColor,
      title: Text(
        'Test ${widget.project.name}',
        style: const TextStyle(color: Colors.white),
      ),
      content: SizedBox(
        width: 350,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                decoration: InputDecoration(
                  labelText: 'Operation',
                  labelStyle: const TextStyle(color: Colors.white70),
                  filled: true,
                  fillColor: kAccentColor,
                  enabledBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.white24),
                  ),
                  focusedBorder: const OutlineInputBorder(
                    borderSide: BorderSide(color: Colors.white),
                  ),
                ),
                dropdownColor: kAccentColor,
                value: selectedCrud,
                iconEnabledColor: Colors.white,
                style: const TextStyle(color: Colors.white),
                items: crudOptions
                    .map((option) => DropdownMenuItem(
                          value: option,
                          child: Text(option, style: const TextStyle(color: Colors.white)),
                        ))
                    .toList(),
                onChanged: (value) {
                  setState(() {
                    selectedCrud = value!;
                  });
                },
              ),
              const SizedBox(height: 8),
              _darkInput(usersController, 'Users', TextInputType.number),
              const SizedBox(height: 8),
              _darkInput(urlController, 'Target URL', TextInputType.url),
              const SizedBox(height: 8),
              _darkInput(rampUpController, 'Ramp-up Period (sec)', TextInputType.number),
              const SizedBox(height: 8),
              _darkInput(testPeriodController, 'Test Period (min)', TextInputType.number),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        final picked = await showDatePicker(
                          context: context,
                          initialDate: scheduledDate ?? DateTime.now(),
                          firstDate: DateTime.now(),
                          lastDate: DateTime.now().add(const Duration(days: 365)),
                        );
                        if (picked != null) {
                          setState(() {
                            scheduledDate = picked;
                          });
                        }
                      },
                      child: AbsorbPointer(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Date',
                            labelStyle: const TextStyle(color: Colors.white70),
                            enabledBorder: const OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.white24),
                            ),
                            focusedBorder: const OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.white),
                            ),
                            fillColor: kAccentColor,
                            filled: true,
                            suffixIcon: const Icon(Icons.calendar_today, color: Colors.white54),
                          ),
                          controller: TextEditingController(
                            text: scheduledDate == null
                                ? ''
                                : "${scheduledDate!.day.toString().padLeft(2, '0')}-${scheduledDate!.month.toString().padLeft(2, '0')}-${scheduledDate!.year}",
                          ),
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: GestureDetector(
                      onTap: () async {
                        final picked = await showTimePicker(
                          context: context,
                          initialTime: scheduledTime ?? TimeOfDay.now(),
                        );
                        if (picked != null) {
                          setState(() {
                            scheduledTime = picked;
                          });
                        }
                      },
                      child: AbsorbPointer(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Time',
                            labelStyle: const TextStyle(color: Colors.white70),
                            enabledBorder: const OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.white24),
                            ),
                            focusedBorder: const OutlineInputBorder(
                              borderSide: BorderSide(color: Colors.white),
                            ),
                            fillColor: kAccentColor,
                            filled: true,
                            suffixIcon: const Icon(Icons.access_time, color: Colors.white54),
                          ),
                          controller: TextEditingController(
                            text: scheduledTime == null
                                ? ''
                                : scheduledTime!.format(context),
                          ),
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => setState(() => showAdvanced = !showAdvanced),
                child: Text(
                  showAdvanced ? 'Hide Advanced Features' : 'Show Advanced Features',
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
              if (showAdvanced) ...[
                _darkInput(loopController, 'Loop', TextInputType.number),
                const SizedBox(height: 8),
                _darkInput(assertionController, 'Assertion', TextInputType.text),
                const SizedBox(height: 8),
                _darkInput(testDataController, 'Test Data', TextInputType.text),
              ],
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () async {
            if (_allFieldsValid()) {
              if (scheduledDate != null && scheduledTime != null) {
                final scheduledDateTime = DateTime(
                  scheduledDate!.year,
                  scheduledDate!.month,
                  scheduledDate!.day,
                  scheduledTime!.hour,
                  scheduledTime!.minute,
                );

                final request = LoadTestConfigRequest(
                  fileName: widget.project.name,
                  targetUrl: urlController.text,
                  numUsers: int.parse(usersController.text),
                  rampUpPeriod: int.parse(rampUpController.text),
                  testDuration: int.parse(testPeriodController.text),
                  scheduledExecutionTime: scheduledDateTime.toIso8601String(),
                  crudType: selectedCrud,
                );

                try {
                  await scheduleLoadTest(request);
                  widget.onRun(scheduledDateTime, {
                    'Operation': selectedCrud,
                    'Users': usersController.text,
                    'Target URL': urlController.text,
                    'Ramp-up Period (sec)': rampUpController.text,
                    'Test Period (min)': testPeriodController.text,
                    if (showAdvanced && loopController.text.isNotEmpty) 'Loop': loopController.text,
                    if (showAdvanced && assertionController.text.isNotEmpty) 'Assertion': assertionController.text,
                    if (showAdvanced && testDataController.text.isNotEmpty) 'Test Data': testDataController.text,
                  });
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Test scheduled (backend)!')),
                  );
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to schedule: $e')),
                  );
                }
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please select both date and time.')),
                );
              }
            } else {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Please fill all required fields.')),
              );
            }
          },
          child: const Text('Run', style: TextStyle(color: Colors.white)),
        ),
      ],
    );
  }

  Widget _darkInput(TextEditingController controller, String label, TextInputType type) {
    return TextField(
      controller: controller,
      keyboardType: type,
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: Colors.white70),
        enabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.white24),
        ),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: Colors.white),
        ),
        fillColor: kAccentColor,
        filled: true,
      ),
    );
  }

  bool _allFieldsValid() {
    return usersController.text.isNotEmpty &&
        urlController.text.isNotEmpty &&
        rampUpController.text.isNotEmpty &&
        testPeriodController.text.isNotEmpty;
  }
}
