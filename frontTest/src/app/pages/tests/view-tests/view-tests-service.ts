import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

// Interface for the backend response
export interface LoadTestResponse {
  id: number;
  testName: string;
  targetUrl: string;
  numUsers: number;
  rampUpPeriod: number;
  testDuration: number;
  crudType: string;
  fileName: string;
  scheduled: boolean;
  scheduledExecutionTime: string | null;
  createdAt: string;
}

// Extended interface for display purposes
export interface LoadTestDisplay extends LoadTestResponse {
  status: string;
  project: string;
  type: string;
  successRate: number;
  duration: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViewTestsService {
  private baseUrl = `${environment.apiUrl}/load-tests`;
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Get all scheduled tests
  getAllScheduledTests(): Observable<LoadTestResponse[]> {
    return this.http.get<LoadTestResponse[]>(`${this.baseUrl}/scheduled-tests`);
  }

  // Get all tests (when you add this endpoint to backend)
  getAllTests(): Observable<LoadTestResponse[]> {
    return this.http.get<LoadTestResponse[]>(`${this.baseUrl}/all-tests`);
  }

  // Get test by ID
  getTestById(id: number): Observable<LoadTestResponse> {
    return this.http.get<LoadTestResponse>(`${this.baseUrl}/${id}`);
  }

  // Delete a test
  deleteTest(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.httpOptions);
  }

  // Stop a running test (when you add this endpoint)
  stopTest(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/stop`, {}, this.httpOptions);
  }

  // Cancel a scheduled test (when you add this endpoint)
  cancelTest(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/cancel`, {}, this.httpOptions);
  }

  // Retry a failed test (when you add this endpoint)
  retryTest(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/retry`, {}, this.httpOptions);
  }

  // Helper methods to transform data for display
  transformTestsForDisplay(tests: LoadTestResponse[]): LoadTestDisplay[] {
    return tests.map(test => ({
      ...test,
      status: this.getTestStatus(test),
      project: this.getProjectFromUrl(test.targetUrl),
      type: this.mapCrudTypeToTestType(test.crudType),
      successRate: this.getRandomSuccessRate(), // Mock data - replace with real data when available
      duration: this.formatDuration(test.testDuration)
    }));
  }

  // Get test status based on scheduling and execution time
  private getTestStatus(test: LoadTestResponse): string {
    if (test.scheduled && test.scheduledExecutionTime) {
      const scheduledTime = new Date(test.scheduledExecutionTime);
      const now = new Date();
      
      if (scheduledTime > now) {
        return 'SCHEDULED';
      } else {
        // Check if it's currently running (you might need to add this field to backend)
        const timeSinceScheduled = now.getTime() - scheduledTime.getTime();
        const testDurationMs = test.testDuration * 1000;
        
        if (timeSinceScheduled < testDurationMs) {
          return 'RUNNING';
        } else {
          return 'COMPLETED';
        }
      }
    }
    
    // For non-scheduled tests, assume completed
    return 'COMPLETED';
  }

  // Extract project name from target URL
  private getProjectFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Map based on hostname or path
      if (hostname.includes('upload') || url.includes('upload')) {
        return 'File Upload Service';
      } else if (hostname.includes('api') || url.includes('api')) {
        return 'API Service';
      } else if (hostname.includes('auth') || url.includes('auth')) {
        return 'Authentication Service';
      } else if (hostname.includes('payment') || url.includes('payment')) {
        return 'Payment System';
      } else if (hostname.includes('ecommerce') || url.includes('ecommerce')) {
        return 'E-commerce API';
      } else if (hostname.includes('dashboard') || url.includes('dashboard')) {
        return 'Dashboard UI';
      } else if (hostname.includes('localhost')) {
        return 'Development Environment';
      } else {
        return 'External Service';
      }
    } catch (error) {
      return 'Unknown Project';
    }
  }

  // Map CRUD type to test type
  private mapCrudTypeToTestType(crudType: string): string {
    switch (crudType?.toUpperCase()) {
      case 'CREATE':
        return 'stress';
      case 'READ':
        return 'load';
      case 'UPDATE':
        return 'spike';
      case 'DELETE':
        return 'volume';
      default:
        return 'load';
    }
  }

  // Generate mock success rate (replace with real data when available)
  private getRandomSuccessRate(): number {
    // Generate a realistic success rate between 75-100%
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
    
    if (remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${hours}h`;
    }
  }

  // Get test counts by status for stats cards
  getTestCountsByStatus(tests: LoadTestDisplay[]): { [key: string]: number } {
    const counts = {
      RUNNING: 0,
      COMPLETED: 0,
      FAILED: 0,
      SCHEDULED: 0,
      DRAFT: 0
    };

    tests.forEach(test => {
      if (counts.hasOwnProperty(test.status)) {
        counts[test.status as keyof typeof counts]++;
      }
    });

    return counts;
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test => 
        test.testName.toLowerCase().includes(query) ||
        test.fileName.toLowerCase().includes(query) ||
        test.targetUrl.toLowerCase().includes(query) ||
        test.project.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    // Project filter
    if (projectFilter) {
      filtered = filtered.filter(test => test.project === projectFilter);
    }

    // Type filter
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

      // Handle date sorting
      if (sortField === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
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
      'ID', 'Test Name', 'File Name', 'Project', 'Target URL', 
      'Type', 'Status', 'Virtual Users', 'Duration', 'Success Rate', 
      'Created At'
    ];
    
    const csvContent = [
      headers.join(','),
      ...tests.map(test => [
        test.id,
        `"${test.testName}"`,
        `"${test.fileName}"`,
        `"${test.project}"`,
        `"${test.targetUrl}"`,
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
