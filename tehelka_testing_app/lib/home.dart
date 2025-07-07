import 'package:flutter/material.dart';
import 'project_service.dart';
import 'profile.dart';
import 'testscreen.dart';
import 'history_screen.dart';
import 'schedule.dart';

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class Project {
  final String name;
  Project(this.name);

  factory Project.fromJson(Map<String, dynamic> json) {
    return Project(
      json['customName'] ?? json['name'] ?? '',
    );
  }
}


class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Project> projects = [];
  int _selectedIndex = 0;
  bool _loadingProjects = false;

  @override
  void initState() {
    super.initState();
    _loadProjects();
  }

  Future<void> _loadProjects() async {
    setState(() => _loadingProjects = true);
    try {
      final fetchedProjects = await fetchProjects();
      setState(() {
        projects = fetchedProjects.cast<Project>();
        _loadingProjects = false;
      });
    } catch (e) {
      setState(() => _loadingProjects = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to load projects: $e')),
      );
    }
  }

  void _onNavBarTap(int index) {
    setState(() {
      _selectedIndex = index;
    });
    if (index == 2) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => const ProfilePage(),
        ),
      );
    }
    // Add navigation for chat if needed
  }

  void _navigateToTestProject(Project project) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => TestScreen(project: project),
      ),
    );
  }

  void _showCreateProjectDialog() {
    String? projectName;
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: kDarkBlue,
          title: const Text('Create Project', style: TextStyle(color: kBisque)),
          content: TextField(
            style: const TextStyle(color: kBisque),
            decoration: InputDecoration(
              labelText: 'Project Name',
              labelStyle: const TextStyle(color: kBisque),
              enabledBorder: const OutlineInputBorder(
                borderSide: BorderSide(color: kBisque),
              ),
              focusedBorder: const OutlineInputBorder(
                borderSide: BorderSide(color: kBisque, width: 2),
              ),
            ),
            onChanged: (val) => projectName = val,
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel', style: TextStyle(color: kBisque)),
            ),
            TextButton(
              onPressed: () async {
                if (projectName != null && projectName!.trim().isNotEmpty) {
                  try {
                    final newProject = await createProject(projectName!.trim());
                    setState(() {
                      projects.add(newProject as Project);
                    });
                    Navigator.of(context).pop();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Project "$projectName" created!')),
                    );
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed to create project: $e')),
                    );
                  }
                }
              },
              child: const Text('Create', style: TextStyle(color: kBisque)),
            ),
          ],
        );
      },
    );
  }
  void _onTestProject(Project project) async {
  try {
    await startTest(project.name); // Call the API to start the test
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => TestScreen(project: project),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to start test: $e')),
    );
  }
}


  Future<void> _deleteProject(String projectName) async {
  try {
    await deleteProject(projectName);
    setState(() {
      projects.removeWhere((p) => p.name == projectName);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Project "$projectName" deleted!')),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to delete project: $e')),
    );
  }
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      appBar: AppBar(
        backgroundColor: kBlack,
        elevation: 0,
        title: const Text(
          'Veritas Load',
          style: TextStyle(color: kBisque),
        ),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Button Row
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _navButton(Icons.history, 'History', () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => HistoryScreen(),
                      ),
                    );
                  }),
                  _navButton(Icons.add_circle, 'Create', _showCreateProjectDialog),
                  _navButton(Icons.schedule, 'Schedule', () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => ScheduleScreen(),
                      ),
                    );
                  }),
                ],
              ),
            ),
            // Divider
            const Divider(
              thickness: 3,
              color: kBisque,
              height: 28,
            ),
            // Projects Container (floating, scrollable, gradient, shadow)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              child: Container(
                constraints: const BoxConstraints(
                  maxHeight: 500,
                ),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2B2A4C), Color(0xFF0A1A2F), kBlack],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: kBisque.withOpacity(0.18),
                      blurRadius: 24,
                      offset: const Offset(0, 12),
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
                            color: kBisque,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Expanded(
                        child: _loadingProjects
                            ? const Center(child: CircularProgressIndicator(color: kBisque))
                            : projects.isEmpty
                                ? const Center(
                                    child: Text(
                                      'No projects yet.',
                                      style: TextStyle(color: kBisque, fontSize: 16),
                                    ),
                                  )
                                : Scrollbar(
                                    child: ListView.builder(
                                      itemCount: projects.length,
                                      itemBuilder: (context, index) {
                                        final project = projects[index];
                                        return Container(
                                          margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                                          decoration: BoxDecoration(
                                            color: kDarkBlue,
                                            borderRadius: BorderRadius.circular(12),
                                            border: Border.all(
                                              color: kBisque,
                                              width: 2,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: kBisque.withOpacity(0.10),
                                                blurRadius: 8,
                                                offset: const Offset(0, 4),
                                              ),
                                            ],
                                          ),
                                          child: ListTile(
                                            title: Text(
                                              project.name,
                                              style: const TextStyle(
                                                  color: kBisque, fontWeight: FontWeight.w500),
                                            ),
                                            trailing: Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: [
                                              ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: kBisque,
                              foregroundColor: kDarkBlue,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text('Test'),
                            onPressed: () => _onTestProject(project),
                          ),

IconButton(
  icon: const Icon(Icons.delete, color: Colors.redAccent),
  tooltip: 'Delete Project',
  onPressed: () async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: kDarkBlue,
        title: const Text('Delete Project', style: TextStyle(color: kBisque)),
        content: Text(
          'Are you sure you want to delete "${project.name}"?',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Cancel', style: TextStyle(color: kBisque)),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Delete', style: TextStyle(color: Colors.redAccent)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await _deleteProject(project.name);
    }
  },
),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const Spacer(),
            _CustomBottomBar(
              selectedIndex: _selectedIndex,
              onTap: _onNavBarTap,
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _navButton(IconData icon, String label, VoidCallback onPressed) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: kDarkBlue,
        foregroundColor: kBisque,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        elevation: 3,
        textStyle: const TextStyle(fontWeight: FontWeight.bold),
      ),
      icon: Icon(icon, color: kBisque, size: 22),
      label: Text(label, style: const TextStyle(color: kBisque)),
      onPressed: onPressed,
    );
  }
}

// Dummy ProfilePage for navigation (replace with your real one)
class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      appBar: AppBar(
        backgroundColor: kBlack,
        title: const Text('Profile', style: TextStyle(color: kBisque)),
      ),
      body: const Center(
        child: Text('Profile Page', style: TextStyle(color: kBisque)),
      ),
    );
  }
}

class _CustomBottomBar extends StatelessWidget {
  final int selectedIndex;
  final void Function(int) onTap;
  const _CustomBottomBar({required this.selectedIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: kDarkBlue,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: kBisque.withOpacity(0.18),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          IconButton(
            icon: Icon(Icons.home,
                color: selectedIndex == 0 ? kBisque : Colors.white54, size: 28),
            onPressed: () => onTap(0),
            tooltip: 'Home',
          ),
          IconButton(
            icon: Icon(Icons.chat_bubble_outline,
                color: selectedIndex == 1 ? kBisque : Colors.white54, size: 28),
            onPressed: () => onTap(1),
            tooltip: 'Chat',
          ),
          IconButton(
            icon: Icon(Icons.person_outline,
                color: selectedIndex == 2 ? kBisque : Colors.white54, size: 28),
            onPressed: () => onTap(2),
            tooltip: 'Profile',
          ),
        ],
      ),
    );
  }
}
