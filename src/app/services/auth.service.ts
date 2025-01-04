import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private router: Router
  ) {}

  // Sign in with email/password
  async login(email: string, password: string) {
    try {
      const result = await this.auth.signInWithEmailAndPassword(email, password);
      if (result.user) {
        // Navigate to calculator page on successful login
        this.router.navigate(['/calculator']);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Sign out
  async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login']);
  }

  // Get current user
  getCurrentUser() {
    return this.auth.currentUser;
  }

  // Get auth state
  getAuthState() {
    return this.auth.authState;
  }
}