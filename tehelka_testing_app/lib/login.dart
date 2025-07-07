import 'package:flutter/material.dart';
import 'home.dart';
import 'signup.dart';
import 'forgotpassword.dart';
import 'project_service.dart'; // <-- Make sure this is imported for API calls

const Color kBlack = Colors.black;
const Color kDarkBlue = Color(0xFF0A1A2F);
const Color kPurple = Color(0xFF5B2A86);
const Color kBisque = Color(0xFFFFE4C4);

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();
  bool loading = false;

  void _signIn() async {
    setState(() => loading = true);
    final success = await loginUser(emailController.text, passwordController.text);
    setState(() => loading = false);
    if (success) {
      Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const HomeScreen()));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Login failed. Check your credentials.')),
      );
    }
  }

  void _goToSignUp() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const SignupPage()),
    );
  }

  void _goToForgotPassword() {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => const ForgotPasswordPage()),
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
                const Icon(Icons.lock_outline, size: 72, color: kBisque),
                const SizedBox(height: 24),
                const Text(
                  'Welcome Back !!!',
                  style: TextStyle(
                    color: kBisque,
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                const SizedBox(height: 32),
                _darkInput('E-mail', controller: emailController),
                const SizedBox(height: 18),
                _darkInput('Password', controller: passwordController, obscure: true),
                const SizedBox(height: 10),
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: _goToForgotPassword,
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(color: kBisque, fontWeight: FontWeight.w500),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
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
                    onPressed: loading ? null : _signIn,
                    child: loading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: kDarkBlue,
                              strokeWidth: 3,
                            ),
                          )
                        : const Text('Enter'),
                  ),
                ),
                const SizedBox(height: 18),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      "Don't have an account?",
                      style: TextStyle(color: kBisque),
                    ),
                    TextButton(
                      onPressed: _goToSignUp,
                      child: const Text(
                        'Sign Up',
                        style: TextStyle(
                          color: kBisque,
                          fontWeight: FontWeight.bold,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _darkInput(String label, {required TextEditingController controller, bool obscure = false}) {
    return TextField(
      controller: controller,
      obscureText: obscure,
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
      keyboardType: label.toLowerCase().contains('email')
          ? TextInputType.emailAddress
          : TextInputType.text,
    );
  }
}
