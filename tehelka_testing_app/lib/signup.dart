import 'package:flutter/material.dart';
import 'login.dart';
import 'project_service.dart'; // Import your API service

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kBisque = Color(0xFFFFE4C4);

class SignupPage extends StatefulWidget {
  const SignupPage({Key? key}) : super(key: key);

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController nameController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  final TextEditingController confirmPasswordController = TextEditingController();
  bool loading = false;

  void _goToLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginPage()),
    );
  }

  void _signUp() async {
    setState(() => loading = true);
    final success = await registerUser(
      email: emailController.text,
      name: nameController.text,
      password: passwordController.text,
      confirmPassword: confirmPasswordController.text,
    );
    setState(() => loading = false);
    if (success) {
      _goToLogin();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signup successful! Please log in.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signup failed. Please check your details.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color.fromARGB(255, 1, 50, 114), Color.fromARGB(255, 34, 1, 67)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.person_add_alt_1, size: 72, color: kBisque),
                const SizedBox(height: 24),
                const Text(
                  'Create Account',
                  style: TextStyle(
                    color: kBisque,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 32),
                _darkInput('Email', controller: emailController, type: TextInputType.emailAddress),
                const SizedBox(height: 18),
                _darkInput('Name', controller: nameController),
                const SizedBox(height: 18),
                _darkInput('Password', controller: passwordController, obscure: true),
                const SizedBox(height: 18),
                _darkInput('Confirm Password', controller: confirmPasswordController, obscure: true),
                const SizedBox(height: 28),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: kBisque,
                      foregroundColor: kDarkBlue,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    onPressed: loading ? null : _signUp,
                    child: loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: kDarkBlue,
                              strokeWidth: 3,
                            ),
                          )
                        : const Text('Sign Up'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _darkInput(String label, {
    required TextEditingController controller,
    bool obscure = false,
    TextInputType type = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      keyboardType: type,
      style: const TextStyle(color: kBisque),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(color: kBisque),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: kBisque),
          borderRadius: BorderRadius.circular(12),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: kBisque, width: 2),
          borderRadius: BorderRadius.circular(12),
        ),
        fillColor: kDarkBlue.withOpacity(0.7),
        filled: true,
      ),
    );
  }
}
