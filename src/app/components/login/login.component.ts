import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      remember: [false]
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      try {
        await this.authService.login(
          this.loginForm.value.username,
          this.loginForm.value.password
        );
      } catch (error: any) {
        this.errorMessage = error.message.replace('Firebase: ', '');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
