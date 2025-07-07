import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  token = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Get token from URL query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.errorMessage = 'Invalid reset link. Please request a new password reset.';
      }
    });

    if (typeof window !== 'undefined' && this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid && this.token) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const newPassword = this.resetPasswordForm.value.newPassword;

      console.log('Submitting password reset with token:', this.token);

      this.authService.resetPassword(this.token, newPassword).subscribe({
        next: (response: string) => {
          console.log('Password reset successful:', response);
          this.isLoading = false;
          this.successMessage = response;
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Password reset error:', error);
          this.isLoading = false;
          
          if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please try again.';
          } else if (error.status === 400) {
            this.errorMessage = error.error || 'Invalid or expired reset token.';
          } else {
            this.errorMessage = 'Failed to reset password. Please try again.';
          }
        }
      });
    } else {
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
    const password = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { 'passwordMismatch': true };
    }
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.resetPasswordForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.resetPasswordForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName === 'newPassword' ? 'Password' : 'Confirm password'} is required`;
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
    }
    
    if (fieldName === 'confirmPassword' && this.resetPasswordForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    
    return '';
  }
}
