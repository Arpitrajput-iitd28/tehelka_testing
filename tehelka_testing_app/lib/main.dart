import 'package:flutter/material.dart';
import 'home.dart';
import 'login.dart';

// Custom Colors
const Color kBlack = Colors.black;
const Color kNavyBlue = Color(0xFF0A183D);
const Color kCardColor = Color(0xFF162447);
const Color kAccentColor = Color(0xFF1F4068);
const Color kBisque = Color(0xFFFFE4C4);

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Veritas Load',
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: kBlack,
        appBarTheme: const AppBarTheme(
          backgroundColor: kNavyBlue,
          iconTheme: IconThemeData(color: kBisque),
          titleTextStyle: TextStyle(
            color: kBisque,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        cardColor: kCardColor,
        colorScheme: ColorScheme.dark(
          primary: kAccentColor,
          secondary: kBisque,
          background: kBlack,
          surface: kCardColor,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: kAccentColor,
          labelStyle: const TextStyle(color: kBisque),
          enabledBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: kBisque),
          ),
          focusedBorder: const OutlineInputBorder(
            borderSide: BorderSide(color: kBisque, width: 2),
          ),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: kNavyBlue,
            foregroundColor: kBisque,
          ),
        ),
        textTheme: const TextTheme(
          bodyMedium: TextStyle(color: kBisque),
          bodyLarge: TextStyle(color: kBisque),
          titleMedium: TextStyle(color: kBisque),
        ),
        iconTheme: const IconThemeData(color: kBisque),
      ),
      darkTheme: ThemeData.dark(),
      themeMode: ThemeMode.dark,
      home: const LoginPage(),
    );
  }
}
