import 'package:flutter/material.dart';
import 'home.dart';

const Color kNavyBlue = Color(0xFF0A183D);
const Color kCardColor = Color(0xFF162447);
const Color kAccentColor = Color(0xFF1F4068);

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JMeter Controller',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: kNavyBlue,
        appBarTheme: const AppBarTheme(
          backgroundColor: kNavyBlue,
          iconTheme: IconThemeData(color: Colors.white),
          titleTextStyle: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
        ),
        cardColor: kCardColor,
        colorScheme: ColorScheme.dark(
          primary: kAccentColor,
          secondary: kCardColor,
          background: kNavyBlue,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: kAccentColor,
          labelStyle: const TextStyle(color: Colors.white70),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.white24),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: Colors.white),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color.fromARGB(255, 8, 44, 89),
            foregroundColor: Colors.white,
          ),
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: Colors.white),
          bodyLarge: TextStyle(color: Colors.white),
          titleMedium: TextStyle(color: Colors.white),
        ),
      ),
      darkTheme: ThemeData.dark(), // Ensures system dark mode always uses dark
      themeMode: ThemeMode.dark,   // Forces dark mode regardless of system setting
      home: const HomeScreen(),
    );
  }
}
