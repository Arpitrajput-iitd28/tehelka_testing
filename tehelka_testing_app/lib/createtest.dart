import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'project.dart';
import 'project_service.dart';

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class CreateTestScreen extends StatefulWidget {
  final Project project;

  const CreateTestScreen({Key? key, required this.project}) : super(key: key);

  @override
  State<CreateTestScreen> createState() => _CreateTestScreenState();
}

class _CreateTestScreenState extends State<CreateTestScreen> {
  final TextEditingController testNameController = TextEditingController();
  PlatformFile? pickedFile;
  String samplerErrorAction = 'Continue';
  final TextEditingController commentController = TextEditingController();
  final TextEditingController usersController = TextEditingController();
  final TextEditingController rampUpController = TextEditingController();
  final TextEditingController loopCountController = TextEditingController();
  final TextEditingController durationController = TextEditingController();
  final TextEditingController startupDelayController = TextEditingController();

  String threadType = 'Thread Properties';

  List<Map<String, String>> utgRows = [
    {'Start thread count': '', 'Initial delay': ''}
  ];
  List<Map<String, String>> utgTimeRows = [
    {'Startup time': '', 'Hold load for': '', 'Shutdown time': ''}
  ];

  final List<String> samplerErrorOptions = [
    'Continue',
    'Start next thread loop',
    'Stop thread',
    'Stop test',
    'Stop test now'
  ];
  final List<String> threadTypeOptions = [
    'Thread Properties',
    'Ultimate Thread Properties'
  ];

  bool scheduleForLater = false;
  DateTime? scheduledDate;
  TimeOfDay? scheduledTime;

  void _handleSubmit() async {
  // Validate input fields and file selection first
  final testRequest = {
    "testName": testNameController.text.trim(),
    // Add other fields as needed
  };
  try {
    final createdTest = await createTestForProject(
      projectId: widget.project.id,
      testRequest: testRequest,
      file: File(pickedFile!.path!),
    );
    // Show success message, pop the screen, or update state
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Test "${createdTest.testName}" created!')),
    );
    Navigator.of(context).pop(); // Or update test list as needed
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Failed to create test: $e')),
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
        title: Text('Create Test for ${widget.project.name}', style: const TextStyle(color: kBisque)),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionLabel('Test Name'),
            _darkInput(testNameController, 'Enter test name'),
            const SizedBox(height: 16),
            _sectionLabel('File Upload'),
            Row(
              children: [
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kDarkBlue,
                    foregroundColor: kBisque,
                  ),
                  icon: const Icon(Icons.attach_file, color: kBisque),
                  label: Text(
                    pickedFile == null ? 'Choose File' : pickedFile!.name,
                    style: const TextStyle(color: kBisque),
                  ),
                  onPressed: () async {
                    FilePickerResult? result = await FilePicker.platform.pickFiles(
                      type: FileType.custom,
                      allowedExtensions: ['pdf', 'csv', 'jmx'],
                    );
                    if (result != null && result.files.isNotEmpty) {
                      setState(() {
                        pickedFile = result.files.first;
                      });
                    }
                  },
                ),
                if (pickedFile != null)
                  IconButton(
                    icon: const Icon(Icons.clear, color: Colors.redAccent),
                    onPressed: () => setState(() => pickedFile = null),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            _sectionLabel('Action after Sampler Error'),
            DropdownButtonFormField<String>(
              decoration: _dropdownDecoration(),
              dropdownColor: kDarkBlue,
              value: samplerErrorAction,
              iconEnabledColor: kBisque,
              style: const TextStyle(color: kBisque),
              items: samplerErrorOptions
                  .map((option) => DropdownMenuItem(
                        value: option,
                        child: Text(option, style: const TextStyle(color: kBisque)),
                      ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  samplerErrorAction = value!;
                });
              },
            ),
            const SizedBox(height: 16),
            _sectionLabel('Comments'),
            _darkInput(commentController, 'Add comments', maxLines: 3),
            const SizedBox(height: 24),
            _sectionLabel('Thread Group Type'),
            DropdownButtonFormField<String>(
              decoration: _dropdownDecoration(),
              dropdownColor: kDarkBlue,
              value: threadType,
              iconEnabledColor: kBisque,
              style: const TextStyle(color: kBisque),
              items: threadTypeOptions
                  .map((option) => DropdownMenuItem(
                        value: option,
                        child: Text(option, style: const TextStyle(color: kBisque)),
                      ))
                  .toList(),
              onChanged: (value) {
                setState(() {
                  threadType = value!;
                });
              },
            ),
            const SizedBox(height: 16),
            _sectionLabel('Thread Properties'),
            _darkInput(usersController, 'Number of users (threads)', type: TextInputType.number),
            const SizedBox(height: 8),
            _darkInput(rampUpController, 'Ramp-up period (seconds)', type: TextInputType.number),
            const SizedBox(height: 8),
            _darkInput(loopCountController, 'Loop count', type: TextInputType.number),
            const SizedBox(height: 8),
            _darkInput(durationController, 'Duration (seconds)', type: TextInputType.number),
            const SizedBox(height: 8),
            _darkInput(startupDelayController, 'Startup delay (seconds)', type: TextInputType.number),
            const SizedBox(height: 24),
            if (threadType == 'Ultimate Thread Properties') ...[
              _sectionLabel('Ultimate Thread Group Table (Startup time, Hold load for, Shutdown time)'),
              _utgTimeTable(),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kDarkBlue,
                    foregroundColor: kBisque,
                  ),
                  icon: const Icon(Icons.add, color: kBisque),
                  label: const Text('Add Row', style: TextStyle(color: kBisque)),
                  onPressed: () {
                    setState(() {
                      utgTimeRows.add({'Startup time': '', 'Hold load for': '', 'Shutdown time': ''});
                    });
                  },
                ),
              ),
              const SizedBox(height: 16),
              _sectionLabel('Ultimate Thread Group Table (Start thread count, Initial delay)'),
              _utgTable(),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: kDarkBlue,
                    foregroundColor: kBisque,
                  ),
                  icon: const Icon(Icons.add, color: kBisque),
                  label: const Text('Add Row', style: TextStyle(color: kBisque)),
                  onPressed: () {
                    setState(() {
                      utgRows.add({'Start thread count': '', 'Initial delay': ''});
                    });
                  },
                ),
              ),
              const SizedBox(height: 16),
            ],
            _sectionLabel('Execution'),
            Row(
              children: [
                Radio<bool>(
                  value: false,
                  groupValue: scheduleForLater,
                  activeColor: kBisque,
                  onChanged: (val) => setState(() => scheduleForLater = val!),
                ),
                const Text('Run Now', style: TextStyle(color: kBisque)),
                const SizedBox(width: 24),
                Radio<bool>(
                  value: true,
                  groupValue: scheduleForLater,
                  activeColor: kBisque,
                  onChanged: (val) => setState(() => scheduleForLater = val!),
                ),
                const Text('Schedule for Later', style: TextStyle(color: kBisque)),
              ],
            ),
            if (scheduleForLater)
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
                          decoration: _inputDecoration('Date'),
                          controller: TextEditingController(
                            text: scheduledDate == null
                                ? ''
                                : "${scheduledDate!.day.toString().padLeft(2, '0')}-${scheduledDate!.month.toString().padLeft(2, '0')}-${scheduledDate!.year}",
                          ),
                          style: const TextStyle(color: kBisque),
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
                          decoration: _inputDecoration('Time'),
                          controller: TextEditingController(
                            text: scheduledTime == null
                                ? ''
                                : scheduledTime!.format(context),
                          ),
                          style: const TextStyle(color: kBisque),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 24),
            Center(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: kBisque,
                  foregroundColor: kDarkBlue,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                onPressed: _handleSubmit,
                child: const Text('Enter'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 6, left: 2),
        child: Text(text, style: const TextStyle(color: kBisque, fontWeight: FontWeight.bold, fontSize: 16)),
      );

  InputDecoration _inputDecoration(String label) => InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: kBisque),
        enabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: kBisque),
        ),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: kBisque),
        ),
        fillColor: kDarkBlue,
        filled: true,
      );

  InputDecoration _dropdownDecoration() => InputDecoration(
        labelText: 'Select action',
        labelStyle: const TextStyle(color: kBisque),
        enabledBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: kBisque),
        ),
        focusedBorder: const OutlineInputBorder(
          borderSide: BorderSide(color: kBisque),
        ),
        fillColor: kDarkBlue,
        filled: true,
      );

  Widget _darkInput(TextEditingController controller, String label,
      {TextInputType type = TextInputType.text, int maxLines = 1}) {
    return TextField(
      controller: controller,
      keyboardType: type,
      maxLines: maxLines,
      style: const TextStyle(color: kBisque),
      decoration: _inputDecoration(label),
    );
  }

  Widget _utgTable() {
    return Table(
      border: TableBorder.all(color: kBisque),
      columnWidths: const {
        0: FlexColumnWidth(2),
        1: FlexColumnWidth(2),
        2: FlexColumnWidth(1),
      },
      children: [
        TableRow(
          decoration: const BoxDecoration(color: kDarkBlue),
          children: [
            const Padding(
              padding: EdgeInsets.all(8),
              child: Text('Start thread count', style: TextStyle(color: kBisque, fontWeight: FontWeight.bold)),
            ),
            const Padding(
              padding: EdgeInsets.all(8),
              child: Text('Initial delay', style: TextStyle(color: kBisque, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(),
          ],
        ),
        ...utgRows.asMap().entries.map((entry) {
          final idx = entry.key;
          final row = entry.value;
          return TableRow(
            children: [
              Padding(
                padding: const EdgeInsets.all(4),
                child: TextField(
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: kBisque),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Count',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                  onChanged: (val) => setState(() => utgRows[idx]['Start thread count'] = val),
                  controller: TextEditingController(text: row['Start thread count']),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(4),
                child: TextField(
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: kBisque),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Delay',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                  onChanged: (val) => setState(() => utgRows[idx]['Initial delay'] = val),
                  controller: TextEditingController(text: row['Initial delay']),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete, color: Colors.redAccent, size: 20),
                onPressed: utgRows.length > 1
                    ? () => setState(() => utgRows.removeAt(idx))
                    : null,
              ),
            ],
          );
        }),
      ],
    );
  }

  Widget _utgTimeTable() {
    return Table(
      border: TableBorder.all(color: kBisque),
      columnWidths: const {
        0: FlexColumnWidth(2),
        1: FlexColumnWidth(2),
        2: FlexColumnWidth(2),
        3: FlexColumnWidth(1),
      },
      children: [
        TableRow(
          decoration: const BoxDecoration(color: kDarkBlue),
          children: [
            const Padding(
              padding: EdgeInsets.all(8),
              child: Text('Startup time', style: TextStyle(color: kBisque, fontWeight: FontWeight.bold)),
            ),
            const Padding(
              padding: EdgeInsets.all(8),
              child: Text('Hold load for', style: TextStyle(color: kBisque, fontWeight: FontWeight.bold)),
            ),
            const Padding(
              padding: EdgeInsets.all(8),
              child: Text('Shutdown time', style: TextStyle(color: kBisque, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(),
          ],
        ),
        ...utgTimeRows.asMap().entries.map((entry) {
          final idx = entry.key;
          final row = entry.value;
          return TableRow(
            children: [
              Padding(
                padding: const EdgeInsets.all(4),
                child: TextField(
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: kBisque),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Startup',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                  onChanged: (val) => setState(() => utgTimeRows[idx]['Startup time'] = val),
                  controller: TextEditingController(text: row['Startup time']),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(4),
                child: TextField(
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: kBisque),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Hold',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                  onChanged: (val) => setState(() => utgTimeRows[idx]['Hold load for'] = val),
                  controller: TextEditingController(text: row['Hold load for']),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(4),
                child: TextField(
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: kBisque),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Shutdown',
                    hintStyle: TextStyle(color: Colors.white38),
                  ),
                  onChanged: (val) => setState(() => utgTimeRows[idx]['Shutdown time'] = val),
                  controller: TextEditingController(text: row['Shutdown time']),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.delete, color: Colors.redAccent, size: 20),
                onPressed: utgTimeRows.length > 1
                    ? () => setState(() => utgTimeRows.removeAt(idx))
                    : null,
              ),
            ],
          );
        }),
      ],
    );
  }
}

