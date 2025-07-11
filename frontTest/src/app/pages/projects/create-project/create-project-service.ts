import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { AuthService } from '../../../services/auth';

// Interface matching your backend ProjectRequest DTO
export interface ProjectRequest {
  name: string;
}

// Interface matching your backend Project entity
export interface Project {
  id: number;
  name: string;
  createdAt: string;
}

// Extended interface for frontend form data
export interface CreateProjectFormData {
  projectName: string;
  projectKey?: string;
  description?: string;
  category?: string;
  priority?: string;
  environments?: Environment[];
  projectLead?: string;
  visibility?: string;
  emailNotifications?: boolean;
  slackNotifications?: boolean;
  slackWebhook?: string;
  defaultTestDuration?: number;
  maxConcurrentTests?: number;
  retentionPeriod?: number;
  autoCleanup?: boolean;
  teamMembers?: TeamMember[];
}

export interface Environment {
  name: string;
  baseUrl: string;
  description?: string;
}

export interface TeamMember {
  email: string;
  role: 'viewer' | 'tester' | 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class CreateProjectService {
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

  // Create a new project - matches your backend endpoint
  createProject(formData: CreateProjectFormData): Observable<Project> {
    console.log('Creating project with form data:', formData);
    
    // Transform frontend form data to backend ProjectRequest format
    const projectRequest: ProjectRequest = {
      name: formData.projectName
    };

    console.log('Sending to backend:', projectRequest);

    return this.http.post<Project>(`${this.baseUrl}/projects/create`, projectRequest, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((error) => {
        console.error('Error creating project:', error);
        throw error;
      })
    );
  }

  // Get all projects
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

  // Validate project name uniqueness (optional - for future use)
  validateProjectName(name: string): Observable<boolean> {
    return this.getAllProjects().pipe(
      catchError(() => of([])),
      map((projects: any[]) => !projects.find(project => project.name === name))
    );
}

  // Generate project key from name (helper method)
  generateProjectKey(projectName: string): string {
    return projectName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 10);
  }

  // Validate project key format
  validateProjectKey(key: string): boolean {
    const keyRegex = /^[A-Z]{3,10}$/;
    return keyRegex.test(key);
  }

  // Save project as draft (placeholder for future implementation)
  saveProjectAsDraft(formData: CreateProjectFormData): Observable<any> {
    console.log('Saving project as draft:', formData);
    
    // For now, just return a success message
    // In the future, this could save to localStorage or a drafts endpoint
    return of({ 
      message: 'Project saved as draft successfully',
      draftId: Date.now().toString()
    });
  }

  // Load draft project (placeholder for future implementation)
  loadProjectDraft(draftId: string): Observable<CreateProjectFormData | null> {
    console.log('Loading project draft:', draftId);
    
    // For now, return null
    // In the future, this could load from localStorage or a drafts endpoint
    return of(null);
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate URL format
  validateUrl(url: string): boolean {
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(url);
  }
}
