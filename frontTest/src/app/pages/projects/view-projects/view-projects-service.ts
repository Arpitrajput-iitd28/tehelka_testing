import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth';

// Interface matching your backend Project entity exactly
export interface Project {
  id: number;
  name: string;
  createdAt: string;
}

// Interface for project creation
export interface ProjectRequest {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ViewProjectsService {
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

  // Get all projects - returns exactly what backend sends
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error fetching projects:', error);
        return of([]);
      })
    );
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

  // Create a new project
  createProject(name: string): Observable<Project> {
    const projectRequest: ProjectRequest = { name };
    
    return this.http.post<Project>(`${this.baseUrl}/projects/create`, projectRequest, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error creating project:', error);
        throw error;
      })
    );
  }

  // Delete a project
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

  // Filter projects based on search query only
  filterProjects(projects: Project[], searchQuery: string): Project[] {
    if (!searchQuery.trim()) {
      return projects;
    }
    
    const query = searchQuery.toLowerCase();
    return projects.filter(project => 
      project.name.toLowerCase().includes(query) ||
      project.id.toString().includes(query)
    );
  }

  // Sort projects
  sortProjects(projects: Project[], sortField: keyof Project, sortDirection: 'asc' | 'desc'): Project[] {
    return projects.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === 'createdAt') {
        aValue = new Date(aValue as string).getTime() as any;
        bValue = new Date(bValue as string).getTime() as any;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase() as any;
        bValue = (bValue as string).toLowerCase() as any;
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

  // Export projects to JSON
  exportProjectsToJson(projects: Project[]): void {
    if (!this.isBrowser) return;
    
    const dataStr = JSON.stringify(projects, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projects-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Export projects to CSV
  exportProjectsToCsv(projects: Project[]): void {
    if (!this.isBrowser) return;
    
    const headers = ['ID', 'Name', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...projects.map(project => [
        project.id,
        `"${project.name}"`,
        `"${project.createdAt}"`
      ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projects-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
