import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { ProjectDetailsService, ProjectDetails, TestSummary } from './projects-details-service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './view-projects-details.html',
  styleUrls: ['./view-projects-details.css']
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  // Data properties
  projectDetails: ProjectDetails | null = null;
  filteredTests: TestSummary[] = [];
  
  // Filter properties
  searchQuery = '';
  statusFilter = '';
  
  // UI state
  isLoading = true;
  isRefreshing = false;
  isDeleting = false;
  
  // Auto-refresh
  private refreshInterval: any;
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectDetailsService: ProjectDetailsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const projectId = +params['id'];
      if (projectId) {
        this.loadProjectDetails(projectId);
        this.startAutoRefresh(projectId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  // Load project details - Fixed to use consistent service method
  loadProjectDetails(projectId: number): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.projectDetailsService.getProject(projectId).subscribe({
      next: (project: any) => {
        console.log('Project loaded:', project);
        setTimeout(() => {
          this.projectDetails = project;
          this.isLoading = false;
          this.applyFilters();
          this.cdr.detectChanges();
        }, 100);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading project:', error);
        setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
          
          if (error.status === 404) {
            alert('Project not found');
            this.router.navigate(['/projects']);
          } else {
            alert('Failed to load project details. Please try again.');
          }
        }, 100);
      }
    });
  }

  // Start auto-refresh
  startAutoRefresh(projectId: number): void {
    this.refreshInterval = setInterval(() => {
      if (!this.isLoading && !this.isRefreshing) {
        this.refreshProjectDetails(projectId);
      }
    }, 30000); // Refresh every 30 seconds
  }

  // Refresh project details - Fixed to use consistent service method
  refreshProjectDetails(projectId?: number): void {
    const id = projectId || this.projectDetails?.id;
    if (!id) return;

    this.isRefreshing = true;
    this.cdr.detectChanges();

    this.projectDetailsService.getProject(id).subscribe({
      next: (project: any) => {
        setTimeout(() => {
          this.projectDetails = project;
          this.isRefreshing = false;
          this.applyFilters();
          this.cdr.detectChanges();
        }, 500);
      },
      error: (error: any) => {
        console.error('Error refreshing project:', error);
        setTimeout(() => {
          this.isRefreshing = false;
          this.cdr.detectChanges();
        }, 500);
      }
    });
  }

  // Apply filters to tests
  applyFilters(): void {
    if (!this.projectDetails?.tests) {
      this.filteredTests = [];
      return;
    }

    let filtered = [...this.projectDetails.tests];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(test =>
        test.testName.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(test => 
        (test.testRunStatus || 'COMPLETED') === this.statusFilter
      );
    }

    this.filteredTests = filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Statistics Methods - Fixed to work with actual data structure
  getTestsCount(): number {
    return this.projectDetails?.tests?.length || 0;
  }

  getCompletedTestsCount(): number {
    if (!this.projectDetails?.tests) return 0;
    return this.projectDetails.tests.filter(test => 
      (test.testRunStatus || 'COMPLETED') === 'COMPLETED'
    ).length;
  }

  getRunningTestsCount(): number {
    if (!this.projectDetails?.tests) return 0;
    return this.projectDetails.tests.filter(test => 
      test.testRunStatus === 'RUNNING'
    ).length;
  }

  getScheduledTestsCount(): number {
    if (!this.projectDetails?.tests) return 0;
    return this.projectDetails.tests.filter(test => 
      test.testRunStatus === 'SCHEDULED'
    ).length;
  }

  getFailedTestsCount(): number {
    if (!this.projectDetails?.tests) return 0;
    return this.projectDetails.tests.filter(test => 
      test.testRunStatus === 'FAILED'
    ).length;
  }

  // Legacy method for backward compatibility
  getTestCountByStatus(status: string): number {
    if (!this.projectDetails?.tests) return 0;
    return this.projectDetails.tests.filter(test => 
      (test.testRunStatus || 'COMPLETED') === status
    ).length;
  }

  getTestsThisWeek(): number {
    if (!this.projectDetails?.tests) return 0;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.projectDetails.tests.filter(test => 
      new Date(test.createdAt) >= oneWeekAgo
    ).length;
  }

  // JMeter-specific Statistics
  getTotalVirtualUsers(): number {
    if (!this.projectDetails?.tests) return 0;
    return this.projectDetails.tests.reduce((total, test) => 
      total + (test.numUsers || 0), 0
    );
  }

  getAverageTestDuration(): number {
    if (!this.projectDetails?.tests || this.projectDetails.tests.length === 0) return 0;
    const total = this.projectDetails.tests.reduce((sum, test) => 
      sum + (test.testDuration || 0), 0
    );
    return Math.round(total / this.projectDetails.tests.length);
  }

  getMaxConcurrentUsers(): number {
    if (!this.projectDetails?.tests) return 0;
    const users = this.projectDetails.tests.map(test => test.numUsers || 0);
    return users.length > 0 ? Math.max(...users) : 0;
  }

  // Status and Icon Methods
  getStatusIcon(status: string | null): string {
    switch (status) {
      case 'RUNNING': return 'fas fa-play';
      case 'COMPLETED': return 'fas fa-check';
      case 'FAILED': return 'fas fa-times';
      case 'SCHEDULED': return 'fas fa-clock';
      default: return 'fas fa-check';
    }
  }

  getStatusClass(status: string | null): string {
    const statusValue = status || 'completed';
    return `status-${statusValue.toLowerCase()}`;
  }

  getStatusDisplayText(status: string | null): string {
    return status || 'Completed';
  }

  // Test Configuration Helper Methods
  hasTestConfig(test: any): boolean {
    return !!(test.numUsers && test.testDuration);
  }

  getTestConfigText(test: any): string {
    if (!this.hasTestConfig(test)) return '';
    return `${test.numUsers} users • ${test.testDuration}s duration`;
  }

  getTestUsers(test: any): number {
    return test.numUsers || 0;
  }

  getTestDuration(test: any): number {
    return test.testDuration || 0;
  }

  // Filter Methods
  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  // Navigation Methods
  createNewTest(): void {
    if (this.projectDetails) {
      this.router.navigate(['/tests/create'], { 
        queryParams: { projectId: this.projectDetails.id } 
      });
    }
  }

  viewTest(testId: number): void {
    this.router.navigate(['/tests', testId]);
  }

  editTest(testId: number): void {
    this.router.navigate(['/tests/edit', testId]);
  }

  // Delete Project
  deleteProject(): void {
    if (!this.projectDetails) return;

    const confirmMessage = `Are you sure you want to delete "${this.projectDetails.name}"? This will permanently delete the project and all its tests.`;
    
    if (!confirm(confirmMessage)) return;

    this.isDeleting = true;
    this.cdr.detectChanges();

    this.projectDetailsService.deleteProject(this.projectDetails.id).subscribe({
      next: () => {
        alert('Project deleted successfully');
        this.router.navigate(['/projects']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting project:', error);
        this.isDeleting = false;
        this.cdr.detectChanges();
        
        let errorMessage = 'Failed to delete project.';
        if (error.status === 409) {
          errorMessage = 'Cannot delete project with existing tests.';
        }
        
        alert(`Error: ${errorMessage}`);
      }
    });
  }

  // Export Project Data
  exportProjectData(): void {
    if (this.projectDetails) {
      this.projectDetailsService.exportProjectData(this.projectDetails);
    }
  }

  // Utility Methods
  formatDate(dateString: string): Date {
    return new Date(dateString);
  }

  getProjectAge(): string {
    if (!this.projectDetails) return '';
    
    const created = new Date(this.projectDetails.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
  getLastUpdated(): string {
  if (!this.projectDetails) return '';
  
  // You can use the project's creation date or add a lastUpdated field
  // For now, using creation date as fallback
  return this.projectDetails.createdAt;
}

  trackByTestId(index: number, test: TestSummary): number {
    return test.id;
  }
}
