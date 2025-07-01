import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'project_service.dart'; // Your API functions
import 'project.dart'; // Your Project model

const Color kNavyBlue = Color(0xFF0A183D);
const Color kCardColor = Color(0xFF162447);
const Color kAccentColor = Color(0xFF1F4068);
const Color kButtonColor = Color(0xFF324A7D);

class ScheduledTest {
  final String projectName;
  final DateTime scheduledDateTime;
  final Map<String, String> parameters;

  ScheduledTest({
    required this.projectName,
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

  Future<void> _addProject(String title, PlatformFile? pickedFile) async {
    try {
      // If your backend supports file upload, send pickedFile as well
      final newProject = await createProject(title, pickedFile?.name);
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
                          _navButton(Icons.notifications, 'Notif', _openNotifications),
                        ],
                      ),
                    ),
                    // Thick divider
                    const Divider(
                      thickness: 4,
                      color: kAccentColor,
                      height: 24,
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
                    // Second divider
                    const Divider(
                      thickness: 4,
                      color: kAccentColor,
                      height: 32,
                    ),
                    // Schedule section
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                      child: Text(
                        "Schedule",
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                    if (scheduledTests.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
                        child: Container(
                          decoration: BoxDecoration(
                            color: kCardColor,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.white.withOpacity(0.10),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              ),
                            ],
                          ),
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: scheduledTests.length,
                            itemBuilder: (context, index) {
                              final sched = scheduledTests[index];
                              return ListTile(
                                leading: const Icon(Icons.timer, color: Colors.white),
                                title: Text(
                                  sched.projectName,
                                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
                                ),
                                subtitle: Text(
                                  'Scheduled at: ${_formatDateTime(sched.scheduledDateTime)}',
                                  style: const TextStyle(color: Colors.white70),
                                ),
                                trailing: IconButton(
                                  icon: const Icon(Icons.info_outline, color: Colors.white70),
                                  onPressed: () {
                                    _showScheduledTestInfo(sched);
                                  },
                                ),
                              );
                            },
                          ),
                        ),
                      )
                    else
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        child: Text(
                          "No tests scheduled.",
                          style: TextStyle(color: Colors.white.withOpacity(0.7)),
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
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('History feature coming soon!')),
    );
  }

  void _openNotifications() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Notifications feature coming soon!')),
    );
  }

  void _showParameterPrompt(Project project) {
    showDialog(
      context: context,
      builder: (context) => _ParameterPromptDialog(
        project: project,
        onRun: (DateTime scheduledDateTime, Map<String, String> params) {
          setState(() {
            scheduledTests.add(
              ScheduledTest(
                projectName: project.name,
                scheduledDateTime: scheduledDateTime,
                parameters: params,
              ),
            );
          });
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
          'Test Details: ${sched.projectName}',
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

// Your _ParameterPromptDialog implementation remains unchanged.
// Make sure to include it below, as in your current code.
