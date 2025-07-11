import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth';
import { ThreadScheduleRow } from './create-test';

export interface TestRequest {
  testName: string;
  comments?: string;
  action: string;
  thread: string;
  numUsers: number;
  rampUpPeriod: number;
  testDuration: number;
  loop: number;
  startdelay: number;
  startupTime: number;
  holdLoadFor: number;
  shutdownTime: number;
  startThreadCount: number;
  initialDelay: number;
  scheduledExecutionTime?: string;
  threadType?: 'STANDARD' | 'ULTIMATE';
  threadSchedule?: ThreadScheduleRow[];
}

export interface TestResponse {
  id: number;
  testName: string;
  comments?: string;
  action: string;
  thread: string;
  numUsers: number;
  rampUpPeriod: number;
  testDuration: number;
  loop: number;
  startdelay: number;
  startupTime: number;
  holdLoadFor: number;
  shutdownTime: number;
  startThreadCount: number;
  initialDelay: number;
  scheduledExecutionTime?: string;
  scheduled: boolean;
  fileName: string;
  createdAt: string;
}

export interface Project {
  id: number;
  name: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CreateTestService {
  private baseUrl = `${environment.apiUrl}`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private getAuthHeaders(): HttpHeaders {
    if (!this.isBrowser) {
      return new HttpHeaders({ 'Content-Type': 'application/json' });
    }
    
    const token = this.authService.getToken();
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  // Get all projects
  getAllProjects(): Observable<Project[]> {
    console.log('Fetching projects from:', `${this.baseUrl}/projects`);
    
    return this.http.get<Project[]>(`${this.baseUrl}/projects`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching projects:', error);
        return of([]);
      })
    );
  }

  // Create a new project
  createProject(name: string): Observable<Project> {
    const projectRequest = { name };
    
    return this.http.post<Project>(`${this.baseUrl}/projects/create`, projectRequest, {
      headers: this.getAuthHeaders()
    });
  }

  // Create a new test under a specific project
  createTest(projectId: number, testRequest: TestRequest, file: File): Observable<TestResponse> {
    const formData = new FormData();
    
    // Add test data as JSON blob
    formData.append('test', new Blob([JSON.stringify(testRequest)], {
      type: 'application/json'
    }));
    
    // Add file
    formData.append('file', file);

    console.log('Creating test with:');
    console.log('- Project ID:', projectId);
    console.log('- Test Request:', testRequest);
    console.log('- File:', file.name);

    // Don't set Content-Type for multipart - let browser handle it
    const headers = this.isBrowser && this.authService.getToken() ? 
      new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` }) : 
      new HttpHeaders();

    return this.http.post<TestResponse>(
      `${this.baseUrl}/projects/${projectId}/tests/create`,
      formData,
      { headers }
    );
  }

  // Fixed conversion method to match form field names
  convertFormToTestRequest(formData: any): TestRequest {
    console.log('Converting form data:', formData);
    
    const testRequest: TestRequest = {
      testName: formData.testName || '',
      comments: formData.comments || '',
      action: formData.action || 'START',
      thread: formData.thread || 'THREAD',
      numUsers: parseInt(formData.numUsers) || 10,
      rampUpPeriod: parseInt(formData.rampUpPeriod) || 5,
      testDuration: parseInt(formData.testDuration) || 60,
      loop: parseInt(formData.loop) || 1,
      startdelay: parseInt(formData.startdelay) || 0,
      startupTime: parseInt(formData.startupTime) || 5,
      holdLoadFor: parseInt(formData.holdLoadFor) || 30,
      shutdownTime: parseInt(formData.shutdownTime) || 5,
      startThreadCount: parseInt(formData.startThreadCount) || 2,
      initialDelay: parseInt(formData.initialDelay) || 0
    };

    // Handle scheduled execution time
    if (formData.scheduleTime && formData.scheduleTime.trim() !== '') {
      try {
        const scheduleDate = new Date(formData.scheduleTime);
        if (!isNaN(scheduleDate.getTime())) {
          // Format to match backend expectation: yyyy-MM-dd'T'HH:mm:ss
          testRequest.scheduledExecutionTime = scheduleDate.toISOString().slice(0, 19);
        }
      } catch (error) {
        console.warn('Invalid schedule time provided:', formData.scheduleTime);
      }
    }

    console.log('Converted test request:', testRequest);
    return testRequest;
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedExtensions = ['.jmx', '.pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      return { 
        valid: false, 
        error: `Invalid file type. Please select a JMX or PDF file.` 
      };
    }

    if (file.size > maxSize) {
      return { 
        valid: false, 
        error: `File size too large. Maximum size is 10MB.` 
      };
    }

    return { valid: true };
  }
}
