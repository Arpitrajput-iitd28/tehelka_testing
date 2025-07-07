import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

// Updated interfaces to match backend DTOs
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
  scheduledExecutionTime?: string; // ISO string format
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
  project: {
    id: number;
    name: string;
  };
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

  constructor(private http: HttpClient) {}

  // Get all projects for dropdown selection
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`);
  }

  // Create a new test under a specific project
  createTest(projectId: number, testRequest: TestRequest, file: File): Observable<TestResponse> {
    const formData = new FormData();
    
    // Add test data as JSON string
    formData.append('test', new Blob([JSON.stringify(testRequest)], {
      type: 'application/json'
    }));
    
    // Add file
    formData.append('file', file);

    return this.http.post<TestResponse>(
      `${this.baseUrl}/projects/${projectId}/tests/create`,
      formData
    );
  }

  // Helper method to convert form data to TestRequest format
  convertFormToTestRequest(formData: any): TestRequest {
    return {
      testName: formData.testName || '',
      comments: formData.description || '',
      action: this.mapTestTypeToAction(formData.testType),
      thread: formData.thread || 'Thread Group',
      numUsers: parseInt(formData.virtualUsers) || 10,
      rampUpPeriod: parseInt(formData.rampUpTime) || 30,
      testDuration: (parseInt(formData.duration) || 5) * 60, // Convert minutes to seconds
      loop: parseInt(formData.loop) || 1,
      startdelay: parseInt(formData.startdelay) || 0,
      startupTime: parseInt(formData.startupTime) || 10,
      holdLoadFor: parseInt(formData.holdLoadFor) || 300,
      shutdownTime: parseInt(formData.shutdownTime) || 10,
      startThreadCount: parseInt(formData.startThreadCount) || 1,
      initialDelay: parseInt(formData.initialDelay) || 0,
      scheduledExecutionTime: formData.scheduleTime ? 
        new Date(formData.scheduleTime).toISOString() : undefined
    };
  }

  private mapTestTypeToAction(testType: string): string {
    switch (testType?.toLowerCase()) {
      case 'load':
        return 'Load Test';
      case 'stress':
        return 'Stress Test';
      case 'spike':
        return 'Spike Test';
      case 'volume':
        return 'Volume Test';
      default:
        return 'Load Test';
    }
  }
}
