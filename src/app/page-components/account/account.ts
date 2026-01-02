import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './account.html',
  styleUrl: './account.scss'
})
export class AccountComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  isUpdatingProfile = false;
  isChangingPassword = false;
  showPassword = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeForms();
  }

  private initializeForms() {
    // Profile form
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });

    // Password change form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  get profileControls() {
    return this.profileForm.controls;
  }

  get passwordControls() {
    return this.passwordForm.controls;
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasMinLength = value.length >= 8;

    if (!hasUpperCase || !hasLowerCase || !hasNumeric || !hasMinLength) {
      return { passwordStrength: true };
    }
    return null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) return null;

    return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  getErrorMessage(form: FormGroup, fieldName: string): string {
    const field = form.controls[fieldName];
    if (field?.errors && field.touched) {
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
      if (field.errors['passwordStrength']) {
        return 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number';
      }
      if (field.errors['passwordMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }

  togglePasswordVisibility(field: string) {
    if (field === 'current') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (field === 'confirm') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onUpdateProfile() {
    if (this.profileForm.valid) {
      this.isUpdatingProfile = true;
      const formValue = this.profileForm.value;

      this.authService.updateProfile({
        name: formValue.name,
        email: formValue.email
      }).subscribe({
        next: (response) => {
          this.isUpdatingProfile = false;
          if (response.success) {
            this.currentUser = response.data;
            this.toastService.success('Profile updated successfully!');
          } else {
            this.toastService.error(response.message || 'Failed to update profile');
          }
        },
        error: (error) => {
          this.isUpdatingProfile = false;
          this.toastService.error(error.error?.message || 'An error occurred while updating profile');
        }
      });
    } else {
      Object.keys(this.profileControls).forEach(key => {
        this.profileControls[key].markAsTouched();
      });
    }
  }

  onChangePassword() {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;
      const formValue = this.passwordForm.value;

      this.authService.changePassword(
        formValue.currentPassword,
        formValue.newPassword
      ).subscribe({
        next: (response) => {
          this.isChangingPassword = false;
          if (response.success) {
            this.toastService.success('Password changed successfully!');
            this.passwordForm.reset();
          } else {
            this.toastService.error(response.message || 'Failed to change password');
          }
        },
        error: (error) => {
          this.isChangingPassword = false;
          this.toastService.error(error.error?.message || 'An error occurred while changing password');
        }
      });
    } else {
      Object.keys(this.passwordControls).forEach(key => {
        this.passwordControls[key].markAsTouched();
      });
    }
  }

  getPasswordStrength(): string {
    const password = this.passwordControls['newPassword'].value;
    if (!password) return '';

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasMinLength = password.length >= 8;

    const strength = [hasUpperCase, hasLowerCase, hasNumeric, hasMinLength].filter(Boolean).length;
    
    if (strength === 0) return '';
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  }
}
