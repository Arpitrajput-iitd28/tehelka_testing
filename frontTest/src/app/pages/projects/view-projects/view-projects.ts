import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { ViewProjectsService, Project } from './view-projects-service';

@Component({
  selector: 'app-view-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './view-projects.html',
  styleUrls: ['./view-projects.css']
})
export class ViewProjectsComponent implements OnInit {
  // Data properties - using only backend Project interface
  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  paginatedProjects: Project[] = [];
  
  // Filter properties
  searchQuery = '';
  statusFilter = '';
  
  // Sorting properties
  sortField: keyof Project = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // UI state
  isLoading = true;
  isRefreshing = false;
  
  Math = Math;

  constructor(
    private router: Router,
    private viewProjectsService: ViewProjectsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  // Load all projects - no fake data
  loadProjects(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.viewProjectsService.getAllProjects().subscribe({
      next: (projects: Project[]) => {
        console.log('Projects loaded from backend:', projects);
        setTimeout(() => {
          this.allProjects = projects;
          this.isLoading = false;
          this.applyFilters();
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        setTimeout(() => {
          this.isLoading = false;
          this.allProjects = [];
          this.applyFilters();
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  // Refresh projects
  refreshProjects(): void {
    this.isRefreshing = true;
    this.cdr.detectChanges();

    this.viewProjectsService.getAllProjects().subscribe({
      next: (projects: Project[]) => {
        setTimeout(() => {
          this.allProjects = projects;
          this.isRefreshing = false;
          this.applyFilters();
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error: any) => {
        console.error('Error refreshing projects:', error);
        setTimeout(() => {
          this.isRefreshing = false;
          this.cdr.detectChanges();
          alert('Failed to refresh projects. Please try again.');
        }, 0);
      }
    });
  }

  // Apply filters and sorting
  applyFilters(): void {
    this.filteredProjects = this.viewProjectsService.filterProjects(
      this.allProjects,
      this.searchQuery
    );

    this.applySorting();
    this.updatePagination();
  }

  // Apply sorting
  applySorting(): void {
    this.filteredProjects = this.viewProjectsService.sortProjects(
      this.filteredProjects,
      this.sortField,
      this.sortDirection
    );
  }

  // Update pagination
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProjects.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedProjects = this.filteredProjects.slice(startIndex, endIndex);
  }

  // Search functionality
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  // Filter change
  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  // Clear filters
  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  // Sorting
  sortBy(field: keyof Project): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.applySorting();
    this.updatePagination();
    this.cdr.detectChanges();
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Navigation methods
  // Action Methods
  viewProject(projectId: number): void {
    console.log('Navigating to project details:', projectId);
    this.router.navigate(['/projects', projectId]); // Remove 'details'
  }


  editProject(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'edit']);
  }

  viewProjectTests(projectId: number): void {
    this.router.navigate(['/projects', projectId, 'tests']);
  }

  // Delete project
  deleteProject(projectId: number): void {
    const project = this.allProjects.find(p => p.id === projectId);
    if (!project) {
      alert('Project not found');
      return;
    }

    if (!confirm(`Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`)) {
      return;
    }

    this.viewProjectsService.deleteProject(project.id).subscribe({
      next: () => {
        console.log('Project deleted successfully');
        this.loadProjects();
        alert(`Project "${project.name}" deleted successfully!`);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    });
  }

  // Export functionality
  exportProjects(): void {
    if (this.filteredProjects.length === 0) {
      alert('No projects to export');
      return;
    }
    this.viewProjectsService.exportProjectsToJson(this.filteredProjects);
  }

  exportProjectsCsv(): void {
    if (this.filteredProjects.length === 0) {
      alert('No projects to export');
      return;
    }
    this.viewProjectsService.exportProjectsToCsv(this.filteredProjects);
  }

  // Statistics methods - simplified for backend data only
  getProjectCountByStatus(status: string): number {
    // Since backend doesn't provide status, return 0
    return 0;
  }

  getTotalTestsCount(): number {
    // Since backend doesn't provide test count, return 0
    return 0;
  }

  getRecentProjectsCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return this.allProjects.filter(project => 
      new Date(project.createdAt) >= oneWeekAgo
    ).length;
  }

  // Utility methods
  formatDate(dateString: string): Date {
    return new Date(dateString);
  }

  getProjectAge(createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  trackByProjectId(index: number, project: Project): number {
    return project.id;
  }
}
