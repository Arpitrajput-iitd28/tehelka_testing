import 'package:flutter/material.dart';
import 'project_service.dart';
import 'login.dart';

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kPurple = Color(0xFF5B2A86); // Signature purple
const Color kBisque = Color(0xFFFFE4C4);

class ForgotPasswordPage extends StatefulWidget {
  const ForgotPasswordPage({Key? key}) : super(key: key);

  @override
  State<ForgotPasswordPage> createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final TextEditingController emailController = TextEditingController();
  bool loading = false;

  void _sendCode() async {
    setState(() => loading = true);
    final success = await resetPassword(emailController.text);
    setState(() => loading = false);
    if (success) {
      // Show confirmation and redirect to login
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: kDarkBlue,
          title: const Text('Code Sent', style: TextStyle(color: kBisque)),
          content: const Text(
            'If this email is registered, a reset code will be sent.',
            style: TextStyle(color: kBisque),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginPage()),
                );
              },
              child: const Text('OK', style: TextStyle(color: kBisque)),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Failed to send reset code. Try again.')),
      );
    }
  }

  void _goToLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: kBlack,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [kPurple, kDarkBlue, kBlack],
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
                const Icon(Icons.lock_reset, size: 72, color: kBisque),
                const SizedBox(height: 24),
                const Text(
                  'Forgot Password',
                  style: TextStyle(
                    color: kBisque,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 32),
                _darkInput('Email', controller: emailController),
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
                    onPressed: loading ? null : _sendCode,
                    child: loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: kDarkBlue,
                              strokeWidth: 3,
                            ),
                          )
                        : const Text('Send Password'),
                  ),
                ),
                const SizedBox(height: 18),
                TextButton(
                  onPressed: _goToLogin,
                  child: const Text(
                    'Back to Login',
                    style: TextStyle(
                      color: kBisque,
                      fontWeight: FontWeight.bold,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _darkInput(String label, {required TextEditingController controller}) {
    return TextField(
      controller: controller,
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
      keyboardType: TextInputType.emailAddress,
    );
  }
}
