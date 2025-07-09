import 'package:flutter/material.dart';

class CreateJMXPage extends StatefulWidget {
  const CreateJMXPage({Key? key}) : super(key: key);

  @override
  State<CreateJMXPage> createState() => _CreateJMXPageState();
}

class _CreateJMXPageState extends State<CreateJMXPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create JMX'),
      ),
      body: Center(
        child: Text('JMX Creation Form Goes Here'),
      ),
    );
  }
}