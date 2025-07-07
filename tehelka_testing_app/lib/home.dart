import 'package:flutter/material.dart';
import 'project_service.dart';
import 'project.dart';
import 'history_screen.dart';
import 'schedule.dart';
import 'create.dart';
import "profile.dart";

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class ScheduledTest {
  final String testName;
  final DateTime scheduledDateTime;
  final Map parameters;

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

class _HomeScreenState extends State<HomeScreen> with TickerProviderStateMixin {
  List<Project> projects = [];
  bool isLoading = true;
  String? error;
  int _selectedIndex = 0;
  late final AnimationController _redoController;

  @override
  void initState() {
    super.initState();
    _loadProjects();
    _redoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
      lowerBound: 0,
      upperBound: 1,
    );
  }

  @override
  void dispose() {
    _redoController.dispose();
    super.dispose();
  }

// Removed duplicate _onNavBarTap method (handled below)

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

  void _onNavBarTap(int index) {
    setState(() {
      _selectedIndex = index;
    });
    if (index == 0) {
      // Already on home, do nothing or scroll to top if needed
    }
    // For chat/profile, add navigation when implemented
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      appBar: AppBar(
        backgroundColor: kBlack,
        elevation: 0,
        title: const Text(
          'VERITAS LOAD',
          style: TextStyle(color: kBisque,
          fontWeight: FontWeight.bold),
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
                  _navButton(Icons.history, 'History', _openHistory , border: BorderSide(color: kBisque, width: 0.75)),
                  _navButton(Icons.add_circle, 'Create', _openCreatePage, border: BorderSide(color: kBisque, width: 0.75)),
                  _navButton(Icons.schedule, 'Schedule', _openSchedule, border: BorderSide(color: kBisque, width: 0.75)),
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
                  maxHeight: 500, // Not full screen
                ),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [const Color.fromARGB(255, 28, 70, 126), const Color.fromARGB(255, 19, 12, 27)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: kBisque,
                    width: 2.5,
                  ),
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
                        child: isLoading
                            ? const Center(child: CircularProgressIndicator(color: kBisque))
                            : error != null
                                ? Center(child: Text('Error: $error', style: const TextStyle(color: Color.fromARGB(255, 82, 14, 9))))
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
                                                  width: 1.5,
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
                                                      color: kBisque, fontWeight: FontWeight.w400),
                                                ),
                                                subtitle: project.file != null
                                                    ? Text(
                                                        project.file!.name,
                                                        style: const TextStyle(
                                                            color: Colors.white70, fontSize: 10),
                                                      )
                                                    : null,
                                                trailing: Row(
                                                  mainAxisSize: MainAxisSize.min,
                                                  children: [
                                                    _AnimatedRedoButton(controller: _redoController),
                                                    const SizedBox(width: 8),
                                                    IconButton(
                                                      icon: const Icon(Icons.delete, color: Color.fromARGB(255, 255, 217, 217)),
                                                      tooltip: 'Delete Project',
                                                      onPressed: () async {
                                                        final confirm = await showDialog<bool>(
                                                          context: context,
                                                          builder: (context) => AlertDialog(
                                                            backgroundColor: kDarkBlue,
                                                            title: const Text('Delete Project',
                                                                style: TextStyle(color: kBisque)),
                                                            content: Text(
                                                              'Are you sure you want to delete "${project.name}"?',
                                                              style: const TextStyle(color: Colors.white70),
                                                            ),
                                                            actions: [
                                                              TextButton(
                                                                onPressed: () => Navigator.of(context).pop(false),
                                                                child: const Text('Cancel',
                                                                    style: TextStyle(color: kBisque)),
                                                              ),
                                                              TextButton(
                                                                onPressed: () => Navigator.of(context).pop(true),
                                                                child: const Text('Delete',
                                                                    style: TextStyle(color: Color.fromARGB(255, 67, 3, 3))),
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
            // Spacer to push bottom bar to bottom
            const Spacer(),
            // Bottom Navigation Bar
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

  Widget _navButton(IconData icon, String label, VoidCallback onPressed, {required BorderSide border}) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: kDarkBlue,
        foregroundColor: kBisque,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: border),
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        elevation: 3,
        textStyle: const TextStyle(fontWeight: FontWeight.bold),
      ),
      icon: Icon(icon, color: kBisque, size: 22),
      label: Text(label, style: const TextStyle(color: kBisque)),
      onPressed: onPressed,
    );
  }

  void _openCreatePage() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CreatePage()));
  }

  void _openHistory() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => HistoryScreen()));
  }

  void _openSchedule() {
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => const ScheduleScreen(),
    ));
  }
}

class _AnimatedRedoButton extends StatefulWidget {
  final AnimationController controller;
  const _AnimatedRedoButton({required this.controller});

  @override
  State<_AnimatedRedoButton> createState() => _AnimatedRedoButtonState();
}

class _AnimatedRedoButtonState extends State<_AnimatedRedoButton> {
  bool _isAnimating = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        if (!_isAnimating) {
          setState(() => _isAnimating = true);
          widget.controller
              .forward(from: 0)
              .whenComplete(() => setState(() => _isAnimating = false));
        }
      },
      child: AnimatedBuilder(
        animation: widget.controller,
        builder: (context, child) {
          return Transform.rotate(
            angle: widget.controller.value * 2 * 3.1415926535,
            child: Icon(Icons.redo, color: kBisque),
          );
        },
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
            icon: Icon(Icons.build_outlined,
                color: selectedIndex == 1 ? kBisque : Colors.white54, size: 28),
            onPressed: () => onTap(1),
            tooltip: 'Maintenance',
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



