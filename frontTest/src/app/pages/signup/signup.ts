import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, SignupRequest } from '../../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    if (typeof window !== 'undefined' && this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const signupRequest: SignupRequest = {
        name: this.signupForm.value.name,
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        confirmPassword: this.signupForm.value.confirmPassword
      };

      console.log('Submitting signup request:', signupRequest);

      this.authService.signup(signupRequest).subscribe({
        next: (response) => {
          console.log('Raw response received:', response);
          console.log('Response type:', typeof response);
          
          this.isLoading = false;
          
          // Handle string response from backend
          if (typeof response === 'string') {
            this.successMessage = response; // Should be "Signup successful"
          } else {
            this.successMessage = 'Account created successfully!';
          }
          
          console.log('Success message set to:', this.successMessage);
          
          // Navigate to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Signup error details:', error);
          console.error('Error status:', error.status);
          console.error('Error body:', error.error);
          
          this.isLoading = false;
          
          // Handle different error scenarios
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your connection.';
          } else if (error.status === 400) {
            // Handle plain text error from backend
            this.errorMessage = typeof error.error === 'string' ? error.error : 'Invalid request. Please check your information.';
          } else if (error.status === 409) {
            this.errorMessage = 'Email already exists. Please use a different email.';
          } else if (error.status === 500) {
            this.errorMessage = 'Server error. Please try again later.';
          } else {
            this.errorMessage = 'Signup failed. Please try again.';
          }
          
          console.log('Error message set to:', this.errorMessage);
        }
      });
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach(key => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const requiredLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${requiredLength} characters long`;
      }
    }
    
    if (fieldName === 'confirmPassword' && this.signupForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }
}
