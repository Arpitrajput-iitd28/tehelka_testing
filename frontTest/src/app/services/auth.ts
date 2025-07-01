import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  login(email: string, password: string): Observable<any> {
    // For now, return a mock response
    return new Observable(observer => {
      // Simulate API call
      setTimeout(() => {
        if (email === 'test@test.com' && password === 'password') {
          observer.next({
            token: 'mock-jwt-token',
            user: { email: email, name: 'Test User' }
          });
        } else {
          observer.error({ error: { message: 'Invalid credentials' } });
        }
        observer.complete();
      }, 1000);
    });
  }
  isAuthenticated(): boolean{
    return !!localStorage.getItem('token');
  }

  logout(): void{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

}
