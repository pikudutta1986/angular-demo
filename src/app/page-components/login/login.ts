import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get formControls() {
    return this.loginForm.controls;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.formControls[fieldName];
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        return 'Password must be at least 6 characters long';
      }
    }
    return '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Login form submitted:', this.loginForm.value);
        this.isLoading = false;
        
        // Navigate to home page after successful login
        this.router.navigate(['/home']);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.formControls).forEach(key => {
        this.formControls[key].markAsTouched();
      });
    }
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
