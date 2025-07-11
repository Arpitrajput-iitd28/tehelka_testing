import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth';

export interface TestSummary {
  id: number;
  testName: string;
  fileName?: string;
  jmxFileData?: string;
  comments?: string;
  action?: string;
  thread?: string;
  numUsers?: number;
  rampUpPeriod?: number;
  testDuration?: number;
  loop?: number;
  startdelay?: number;
  startupTime?: number;
  holdLoadFor?: number;
  shutdownTime?: number;
  startThreadCount?: number;
  initialDelay?: number;
  testRunStatus: string;
  scheduledExecutionTime?: string | null;
  createdAt: string;
}

export interface LoadTestDisplay {
  id: number;
  testName: string;
  createdAt: string;
  testRunStatus: string;
  status: string;
  type: string;
  successRate: number;
  duration: string;
  projectName: string;
  project: {
    id: number;
    name: string;
  };
  comments?: string;
  action?: string;
  thread?: string;
  numUsers?: number;
  rampUpPeriod?: number;
  testDuration?: number;
  loop?: number;
  startdelay?: number;
  startupTime?: number;
  holdLoadFor?: number;
  shutdownTime?: number;
  startThreadCount?: number;
  initialDelay?: number;
  scheduledExecutionTime?: string;
  scheduled?: boolean;
  fileName?: string;
}

export interface Project {
  id: number;
  name: string;
  createdAt: string;
  tests?: TestSummary[];
}

@Injectable({
  providedIn: 'root'
})
export class ViewTestsService {
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
      return new HttpHeaders({
        'Content-Type': 'application/json'
      });
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

  // Get all projects with embedded tests (matches your backend structure)
  getAllProjects(): Observable<Project[]> {
    console.log('Fetching projects from:', `${this.baseUrl}/projects`);
    
    return this.http.get<Project[]>(`${this.baseUrl}/projects`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => {
        console.log('Raw backend response:', response);
        
        if (Array.isArray(response)) {
          return response;
        } else if (response && typeof response === 'object') {
          return [response];
        } else {
          return [];
        }
      }),
      catchError((error) => {
        console.error('Error fetching projects:', error);
        return of([]);
      })
    );
  }

  // Get tests for a specific project (simplified endpoint)
  getTestsForProject(projectId: number): Observable<TestSummary[]> {
    console.log(`Fetching tests for project ${projectId}`);
    
    return this.http.get<TestSummary[]>(`${this.baseUrl}/projects/${projectId}/tests`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(tests => {
        console.log(`Tests for project ${projectId}:`, tests);
        return tests;
      }),
      catchError((error) => {
        console.error(`Error fetching tests for project ${projectId}:`, error);
        return of([]);
      })
    );
  }

  // Get all tests across all projects - FIXED to use real backend data
  getAllTests(): Observable<LoadTestDisplay[]> {
    console.log('Getting all tests using projects endpoint...');
    
    return this.getAllProjects().pipe(
      map(projects => {
        console.log('Projects received:', projects);
        
        if (!projects || projects.length === 0) {
          console.warn('No projects found');
          return [];
        }

        const allTests: LoadTestDisplay[] = [];
        
        projects.forEach(project => {
          console.log(`Processing project: ${project.name} (ID: ${project.id})`);
          
          // Check if project has embedded tests
          if (project.tests && Array.isArray(project.tests)) {
            console.log(`Project has ${project.tests.length} embedded tests`);
            
            project.tests.forEach(test => {
              console.log(`Processing embedded test: ${test.testName} with status: ${test.testRunStatus}`);
              
              const transformedTest = this.transformTestForDisplay(test, project);
              allTests.push(transformedTest);
            });
          } else {
            console.log(`Project ${project.name} has no embedded tests`);
          }
        });

        console.log('Total tests processed:', allTests.length);
        console.log('All transformed tests:', allTests);
        
        return allTests;
      }),
      catchError((error) => {
        console.error('Error processing tests:', error);
        return of([]);
      })
    );
  }

  // Transform test for display - FIXED to preserve exact backend data
  private transformTestForDisplay(test: TestSummary, project: Project): LoadTestDisplay {
    console.log('Transforming test:', test.testName, 'with status:', test.testRunStatus);
    
    const transformed: LoadTestDisplay = {
      id: test.id,
      testName: test.testName,
      createdAt: test.createdAt,
      
      // CRITICAL: Use exact backend status without any modification
      testRunStatus: test.testRunStatus,
      status: test.testRunStatus, // Keep both for compatibility
      
      type: this.getTestTypeFromAction(test.action),
      projectName: project.name,
      project: {
        id: project.id,
        name: project.name
      },
      
      // Use ALL real backend data - no random generation
      comments: test.comments || '',
      action: test.action || '',
      thread: test.thread || '',
      numUsers: test.numUsers || 0,
      rampUpPeriod: test.rampUpPeriod || 0,
      testDuration: test.testDuration || 0,
      loop: test.loop || 1,
      startdelay: test.startdelay || 0,
      startupTime: test.startupTime || 0,
      holdLoadFor: test.holdLoadFor || 0,
      shutdownTime: test.shutdownTime || 0,
      startThreadCount: test.startThreadCount || 0,
      initialDelay: test.initialDelay || 0,
      scheduledExecutionTime: test.scheduledExecutionTime || undefined,
      scheduled: !!test.scheduledExecutionTime,
      fileName: test.fileName || '',
      
      // Calculate derived values based on real data
      successRate: this.calculateSuccessRate(test.testRunStatus),
      duration: this.formatDurationFromSeconds(test.testDuration || 0)
    };
    
    console.log('Transformed test result:', transformed);
    return transformed;
  }

  // Helper methods - FIXED to not use random data
  private getTestTypeFromAction(action?: string): string {
    if (!action) return 'load';
    
    switch (action.toLowerCase()) {
      case 'stress': return 'stress';
      case 'spike': return 'spike';
      case 'volume': return 'volume';
      case 'continue': return 'load';
      case 'start': return 'load';
      default: return 'load';
    }
  }

  private calculateSuccessRate(status: string): number {
    if (!status) return 0;
    
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 100;
      case 'RUNNING': return 85;
      case 'FAILED': return 0;
      case 'SCHEDULED': return 0;
      default: return 0;
    }
  }

  private formatDurationFromSeconds(seconds: number): string {
    if (!seconds || seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  // Utility methods for filtering and sorting
  filterTests(tests: LoadTestDisplay[], searchQuery: string, statusFilter: string, projectFilter: string, typeFilter: string): LoadTestDisplay[] {
    let filtered = [...tests];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test => 
        test.testName.toLowerCase().includes(query) ||
        test.projectName.toLowerCase().includes(query) ||
        test.comments?.toLowerCase().includes(query) ||
        test.fileName?.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      console.log('Filtering by status:', statusFilter);
      filtered = filtered.filter(test => {
        console.log(`Test ${test.id} status: ${test.testRunStatus}, filter: ${statusFilter}`);
        return test.testRunStatus === statusFilter;
      });
    }

    if (projectFilter) {
      filtered = filtered.filter(test => test.projectName === projectFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(test => test.type === typeFilter);
    }

    console.log('Filtered results:', filtered.length);
    return filtered;
  }

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

  paginateTests(tests: LoadTestDisplay[], page: number, pageSize: number): LoadTestDisplay[] {
    const startIndex = (page - 1) * pageSize;
    return tests.slice(startIndex, startIndex + pageSize);
  }

  getTestCountsByStatus(tests: LoadTestDisplay[]): { [status: string]: number } {
    const counts: { [status: string]: number } = {};
    
    tests.forEach(test => {
      const status = test.testRunStatus;
      counts[status] = (counts[status] || 0) + 1;
    });
    
    console.log('Status counts calculated:', counts);
    return counts;
  }

  // API methods
  deleteTest(projectId: number, testId: number): Observable<any> {
    console.log(`Deleting test ${testId} from project ${projectId}`);
    
    return this.http.delete(`${this.baseUrl}/projects/${projectId}/tests/${testId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error deleting test:', error);
        throw error;
      })
    );
  }

  stopTest(testId: number): Observable<any> {
    console.log(`Stopping test ${testId}`);
    return of({ message: 'Stop test functionality not yet implemented' });
  }

  cancelTest(testId: number): Observable<any> {
    console.log(`Cancelling test ${testId}`);
    return of({ message: 'Cancel test functionality not yet implemented' });
  }

  retryTest(testId: number): Observable<any> {
    console.log(`Retrying test ${testId}`);
    return of({ message: 'Retry test functionality not yet implemented' });
  }

  // Export methods
  exportTestsToJson(tests: LoadTestDisplay[]): void {
    if (!this.isBrowser) return;
    
    const dataStr = JSON.stringify(tests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `load-tests-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  exportTestsToCsv(tests: LoadTestDisplay[]): void {
    if (!this.isBrowser) return;
    
    const headers = ['ID', 'Test Name', 'Project', 'Status', 'Type', 'Success Rate', 'Duration', 'Created At'];
    
    const csvContent = [
      headers.join(','),
      ...tests.map(test => [
        test.id,
        `"${test.testName}"`,
        `"${test.projectName}"`,
        test.testRunStatus, // Use the real status
        test.type,
        `${test.successRate}%`,
        `"${test.duration}"`,
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
