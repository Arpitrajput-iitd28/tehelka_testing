import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth';

// Interface for test summary (what we get from the list endpoint)
export interface TestSummary {
  testName: string;
  createdAt: string;
}

// Interface for full test details
export interface TestDetails {
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

// Extended interface for display purposes (this was missing)
export interface LoadTestDisplay extends TestDetails {
  status: string;
  type: string;
  successRate: number;
  duration: string;
  projectName: string;
}

export interface Project {
  id: number;
  name: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViewTestsService {
  private baseUrl = `${environment.apiUrl}/projects`;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all projects
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${environment.apiUrl}/projects`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get tests for a specific project
  getTestsForProject(projectId: number): Observable<TestSummary[]> {
    return this.http.get<TestSummary[]>(`${this.baseUrl}/${projectId}/tests`, {
      headers: this.getAuthHeaders()
    });
  }

  // Get all scheduled tests (for backward compatibility)
  getAllScheduledTests(): Observable<any[]> {
    // For now, use a hardcoded project ID or get from first available project
    const projectId = 1; // You may want to make this configurable
    return this.getTestsForProject(projectId);
  }

  // Get all tests across all projects
  getAllTests(): Observable<LoadTestDisplay[]> {
    return this.getAllProjects().pipe(
      switchMap(projects => {
        if (projects.length === 0) {
          return of([]);
        }
        
        const testRequests = projects.map(project =>
          this.getTestsForProject(project.id).pipe(
            map(tests => tests.map(test => ({ 
              ...test, 
              projectId: project.id, 
              projectName: project.name,
              project: { id: project.id, name: project.name }
            })))
          )
        );
        
        return forkJoin(testRequests).pipe(
          map(projectTests => {
            const allTests = projectTests.flat();
            return this.transformTestsForDisplay(allTests);
          })
        );
      })
    );
  }

  // Transform tests for display
  transformTestsForDisplay(tests: any[]): LoadTestDisplay[] {
    return tests.map(test => ({
      ...test,
      id: test.id || Math.random(), // Ensure ID exists
      testName: test.testName || 'Unknown Test',
      comments: test.comments || '',
      action: test.action || 'Load Test',
      thread: test.thread || 'Thread Group',
      numUsers: test.numUsers || 10,
      rampUpPeriod: test.rampUpPeriod || 30,
      testDuration: test.testDuration || 300,
      loop: test.loop || 1,
      startdelay: test.startdelay || 0,
      startupTime: test.startupTime || 10,
      holdLoadFor: test.holdLoadFor || 300,
      shutdownTime: test.shutdownTime || 10,
      startThreadCount: test.startThreadCount || 1,
      initialDelay: test.initialDelay || 0,
      scheduledExecutionTime: test.scheduledExecutionTime,
      scheduled: test.scheduled || false,
      fileName: test.fileName || 'test.jmx',
      createdAt: test.createdAt || new Date().toISOString(),
      project: test.project || { id: 1, name: 'Default Project' },
      status: this.getTestStatus(test),
      type: this.mapActionToTestType(test.action || 'Load Test'),
      successRate: this.getRandomSuccessRate(),
      duration: this.formatDuration(test.testDuration || 300),
      projectName: test.projectName || test.project?.name || 'Unknown Project'
    }));
  }

  // Get test status based on scheduling
  private getTestStatus(test: any): string {
    if (test.scheduled && test.scheduledExecutionTime) {
      const scheduledTime = new Date(test.scheduledExecutionTime);
      const now = new Date();
      
      if (scheduledTime > now) {
        return 'SCHEDULED';
      } else {
        const timeSinceScheduled = now.getTime() - scheduledTime.getTime();
        const testDurationMs = (test.testDuration || 300) * 1000;
        
        if (timeSinceScheduled < testDurationMs) {
          return 'RUNNING';
        } else {
          return 'COMPLETED';
        }
      }
    }
    
    return 'COMPLETED';
  }

  // Map action back to test type
  private mapActionToTestType(action: string): string {
    switch (action?.toLowerCase()) {
      case 'stress test':
        return 'stress';
      case 'spike test':
        return 'spike';
      case 'volume test':
        return 'volume';
      case 'load test':
      default:
        return 'load';
    }
  }

  // Generate mock success rate
  private getRandomSuccessRate(): number {
    return Math.floor(Math.random() * 25) + 75;
  }

  // Format duration from seconds to human readable format
  private formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  // Filter tests based on search and filter criteria
  filterTests(
    tests: LoadTestDisplay[], 
    searchQuery: string, 
    statusFilter: string, 
    projectFilter: string, 
    typeFilter: string
  ): LoadTestDisplay[] {
    let filtered = [...tests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test => 
        test.testName.toLowerCase().includes(query) ||
        test.fileName.toLowerCase().includes(query) ||
        test.projectName.toLowerCase().includes(query) ||
        test.comments?.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    if (projectFilter) {
      filtered = filtered.filter(test => test.projectName === projectFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(test => test.type === typeFilter);
    }

    return filtered;
  }

  // Sort tests by field and direction
  sortTests(tests: LoadTestDisplay[], sortField: string, sortDirection: 'asc' | 'desc'): LoadTestDisplay[] {
    return tests.sort((a, b) => {
      let aValue: any = a[sortField as keyof LoadTestDisplay];
      let bValue: any = b[sortField as keyof LoadTestDisplay];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Paginate tests
  paginateTests(tests: LoadTestDisplay[], page: number, pageSize: number): LoadTestDisplay[] {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tests.slice(startIndex, endIndex);
  }

  // Get test counts by status
  getTestCountsByStatus(tests: LoadTestDisplay[]): { [status: string]: number } {
    const counts: { [status: string]: number } = {};
    tests.forEach(test => {
      counts[test.status] = (counts[test.status] || 0) + 1;
    });
    return counts;
  }

  // Delete a test (fixed to match backend API)
  deleteTest(projectId: number, testId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${projectId}/tests/${testId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Test control methods (placeholders for future implementation)
  stopTest(testId: number): Observable<any> {
    // Placeholder - implement when backend supports it
    return of({ message: 'Stop test functionality not yet implemented' });
  }

  cancelTest(testId: number): Observable<any> {
    // Placeholder - implement when backend supports it
    return of({ message: 'Cancel test functionality not yet implemented' });
  }

  retryTest(testId: number): Observable<any> {
    // Placeholder - implement when backend supports it
    return of({ message: 'Retry test functionality not yet implemented' });
  }

  // Export tests to JSON
  exportTestsToJson(tests: LoadTestDisplay[]): void {
    const dataStr = JSON.stringify(tests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `load-tests-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Export tests to CSV
  exportTestsToCsv(tests: LoadTestDisplay[]): void {
    const headers = [
      'ID', 'Test Name', 'File Name', 'Project', 'Action', 
      'Type', 'Status', 'Virtual Users', 'Duration', 'Success Rate', 
      'Created At'
    ];
    
    const csvContent = [
      headers.join(','),
      ...tests.map(test => [
        test.id,
        `"${test.testName}"`,
        `"${test.fileName}"`,
        `"${test.project.name}"`,
        `"${test.action}"`,
        test.type,
        test.status,
        test.numUsers,
        `"${test.duration}"`,
        `${test.successRate}%`,
        `"${test.createdAt}"`
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `load-tests-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
