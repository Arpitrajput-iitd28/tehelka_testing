import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface JwtResponse {
  token: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  // Login user
  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    const loginUrl = `${this.baseUrl}/login`;
    console.log('Attempting login to:', loginUrl);
    console.log('Login request:', loginRequest);
    
    return this.http.post<JwtResponse>(loginUrl, loginRequest, this.httpOptions)
      .pipe(
        tap(response => {
          console.log('Login response received:', response);
          if (response.token && this.isBrowser) {
            this.setToken(response.token);
            this.setUserFromToken(response.token);
          }
        })
      );
  }

  // Signup user
  signup(signupRequest: SignupRequest): Observable<string> {
    const signupUrl = `${this.baseUrl}/signup`;
    console.log('Auth service - attempting signup to:', signupUrl);
    console.log('Auth service - signup request:', signupRequest);
    
    return this.http.post(signupUrl, signupRequest, {
      headers: this.httpOptions.headers,
      responseType: 'text'
    });
  }
  // Logout user
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  }

  // Get stored token
  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Private methods
  private setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('token', token);
    }
  }

  private setUserFromToken(token: string): void {
    if (!this.isBrowser) return;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.userId || payload.sub,
        name: payload.name || 'User',
        email: payload.email || payload.sub
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  private loadUserFromStorage(): void {
    if (!this.isBrowser) return;
    
    const token = this.getToken();
    const userStr = localStorage.getItem('user');
    
    if (token && userStr && this.isAuthenticated()) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
        this.logout();
      }
    }
  }
}
