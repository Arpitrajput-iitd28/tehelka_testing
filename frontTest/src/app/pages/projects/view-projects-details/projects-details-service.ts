import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth';

// Interfaces
export interface Project {
  id: number;
  name: string;
  createdAt: string;
}

export interface TestSummary {
  id: number;
  testName: string;
  fileName: string;
  jmxFileData: string;
  comments: string;
  action: string;
  thread: string;
  numUsers: number;        // Add this
  rampUpPeriod: number;
  testDuration: number;    // Add this
  loop: number;
  startdelay: number;
  startupTime: number;
  holdLoadFor: number;
  shutdownTime: number;
  startThreadCount: number;
  initialDelay: number;
  testRunStatus: string | null;
  scheduledExecutionTime: string | null;
  createdAt: string;
}

export interface ProjectStats {
  totalTests: number;
  runningTests: number;
  completedTests: number;
  failedTests: number;
  scheduledTests: number;
  recentActivity: TestSummary[];
  testsByStatus: { [key: string]: number };
  testsThisWeek: number;
  testsThisMonth: number;
}

export interface ProjectDetails extends Project {
  stats: ProjectStats;
  tests: TestSummary[];
}

@Injectable({
  providedIn: 'root'
})
export class ProjectDetailsService {
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

  // Get project by ID
  getProject(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching project:', error);
        throw error;
      })
    );
  }

  // Get tests for project
  getProjectTests(projectId: number): Observable<TestSummary[]> {
    return this.http.get<TestSummary[]>(`${this.baseUrl}/projects/${projectId}/tests`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching project tests:', error);
        return of([]);
      })
    );
  }

  // Get project details with statistics
  getProjectDetails(id: number): Observable<ProjectDetails> {
    return forkJoin({
      project: this.getProject(id),
      tests: this.getProjectTests(id)
    }).pipe(
      map(({ project, tests }) => {
        const stats = this.calculateProjectStats(tests);
        return {
          ...project,
          stats,
          tests
        };
      }),
      catchError((error) => {
        console.error('Error fetching project details:', error);
        throw error;
      })
    );
  }

  // Calculate project statistics
  private calculateProjectStats(tests: TestSummary[]): ProjectStats {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const runningTests = tests.filter(t => t.testRunStatus === 'RUNNING').length;
    const completedTests = tests.filter(t => t.testRunStatus === 'COMPLETED' || !t.testRunStatus).length;
    const failedTests = tests.filter(t => t.testRunStatus === 'FAILED').length;
    const scheduledTests = tests.filter(t => t.testRunStatus === 'SCHEDULED').length;

    const testsThisWeek = tests.filter(t => new Date(t.createdAt) >= oneWeekAgo).length;
    const testsThisMonth = tests.filter(t => new Date(t.createdAt) >= oneMonthAgo).length;

    const recentActivity = tests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    const testsByStatus: { [key: string]: number } = {};
    tests.forEach(test => {
      const status = test.testRunStatus || 'COMPLETED';
      testsByStatus[status] = (testsByStatus[status] || 0) + 1;
    });

    return {
      totalTests: tests.length,
      runningTests,
      completedTests,
      failedTests,
      scheduledTests,
      recentActivity,
      testsByStatus,
      testsThisWeek,
      testsThisMonth
    };
  }

  // Delete project
  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/projects/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error deleting project:', error);
        throw error;
      })
    );
  }

  // Export project data
  exportProjectData(projectDetails: ProjectDetails): void {
    if (!this.isBrowser) return;
    
    const exportData = {
      project: {
        id: projectDetails.id,
        name: projectDetails.name,
        createdAt: projectDetails.createdAt
      },
      statistics: projectDetails.stats,
      tests: projectDetails.tests
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-${projectDetails.name}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
