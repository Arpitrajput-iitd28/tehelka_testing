import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout';
import { ViewTestsService, LoadTestDisplay } from './view-tests-service';

@Component({
  selector: 'app-view-tests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './view-tests.html',
  styleUrls: ['./view-tests.css']
})
export class ViewTestsComponent implements OnInit {
  // Data properties
  allTests: LoadTestDisplay[] = [];
  filteredTests: LoadTestDisplay[] = [];
  paginatedTests: LoadTestDisplay[] = [];

  // Filter properties
  searchQuery = '';
  statusFilter = '';
  projectFilter = '';
  typeFilter = '';

  // Sorting properties
  sortField = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // UI state
  isRefreshing = false;
  isLoading = true;
  Math = Math;

  // Add current date for template
  currentDate = new Date();

  constructor(
    private router: Router,
    private viewTestsService: ViewTestsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  // Load tests - Fixed to use real backend data structure
  loadTests(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    console.log('Loading tests from backend...');
    
    this.viewTestsService.getAllTests().subscribe({
      next: (tests) => {
        console.log('Raw tests loaded from backend:', tests);
        console.log('Number of tests loaded:', tests.length);
        
        // Log each test's status to debug
        tests.forEach(test => {
          console.log(`Test ${test.id} (${test.testName}): Status = ${test.testRunStatus}`);
        });
        
        this.allTests = tests;
        this.isLoading = false;
        this.currentDate = new Date();
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.isLoading = false;
        this.allTests = [];
        this.currentDate = new Date();
        this.applyFilters();
        this.cdr.detectChanges();
      }
    });
  }

  // Refresh tests with proper change detection
  refreshTests(): void {
    this.isRefreshing = true;
    this.cdr.detectChanges();
    
    console.log('Refreshing tests...');
    
    this.viewTestsService.getAllTests().subscribe({
      next: (tests) => {
        console.log('Tests refreshed from backend:', tests);
        
        // Log status verification on refresh
        tests.forEach(test => {
          console.log(`Refreshed Test ${test.id}: Status = ${test.testRunStatus}`);
        });
        
        this.allTests = tests;
        this.isRefreshing = false;
        this.currentDate = new Date();
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error refreshing tests:', error);
        this.isRefreshing = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Filter and Search Methods
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.projectFilter = '';
    this.typeFilter = '';
    this.currentPage = 1;
    this.applyFilters();
    this.cdr.detectChanges();
  }

  applyFilters(): void {
    console.log('Applying filters to tests:', this.allTests.length);
    
    this.filteredTests = this.viewTestsService.filterTests(
      this.allTests,
      this.searchQuery,
      this.statusFilter,
      this.projectFilter,
      this.typeFilter
    );

    console.log('Filtered tests count:', this.filteredTests.length);
    
    this.applySorting();
    this.updatePagination();
  }

  // Sorting Methods
  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.updatePagination();
  }

  applySorting(): void {
    this.filteredTests = this.viewTestsService.sortTests(
      this.filteredTests,
      this.sortField,
      this.sortDirection
    );
  }

  // Pagination Methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTests.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    this.paginatedTests = this.viewTestsService.paginateTests(
      this.filteredTests,
      this.currentPage,
      this.pageSize
    );
    
    console.log('Paginated tests for display:', this.paginatedTests);
  }

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

  // Utility Methods
  getTestCountByStatus(status: string): number {
    const counts = this.viewTestsService.getTestCountsByStatus(this.allTests);
    console.log('Status counts:', counts);
    return counts[status] || 0;
  }

  trackByTestId(index: number, test: LoadTestDisplay): number {
    return test.id;
  }

  // Action Methods
  viewReport(testId: number): void {
    this.router.navigate(['/reports', testId]);
  }

  stopTest(testId: number): void {
    if (confirm('Are you sure you want to stop this test?')) {
      // TODO: Implement actual stop functionality
      this.viewTestsService.stopTest(testId).subscribe({
        next: () => {
          console.log('Test stopped successfully');
          this.refreshTests(); // Refresh to get updated status
        },
        error: (error) => {
          console.error('Error stopping test:', error);
          alert('Failed to stop test. Please try again.');
        }
      });
    }
  }

  cancelTest(testId: number): void {
    if (confirm('Are you sure you want to cancel this scheduled test?')) {
      // TODO: Implement actual cancel functionality
      this.viewTestsService.cancelTest(testId).subscribe({
        next: () => {
          console.log('Test cancelled successfully');
          this.refreshTests(); // Refresh to get updated status
        },
        error: (error) => {
          console.error('Error cancelling test:', error);
          alert('Failed to cancel test. Please try again.');
        }
      });
    }
  }

  editTest(testId: number): void {
    this.router.navigate(['/tests/edit', testId]);
  }

  retryTest(testId: number): void {
    if (confirm('Are you sure you want to retry this test?')) {
      // TODO: Implement actual retry functionality
      this.viewTestsService.retryTest(testId).subscribe({
        next: () => {
          console.log('Test retry initiated successfully');
          this.refreshTests(); // Refresh to get updated status
        },
        error: (error) => {
          console.error('Error retrying test:', error);
          alert('Failed to retry test. Please try again.');
        }
      });
    }
  }

  duplicateTest(testId: number): void {
    this.router.navigate(['/tests/create'], { queryParams: { duplicate: testId } });
  }

  deleteTest(testId: number): void {
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      const test = this.allTests.find(t => t.id === testId);
      if (!test) {
        alert('Test not found');
        return;
      }

      // Use the actual delete API call
      this.viewTestsService.deleteTest(test.project.id, testId).subscribe({
        next: () => {
          console.log('Test deleted successfully');
          // Remove from local array
          this.allTests = this.allTests.filter(t => t.id !== testId);
          this.applyFilters();
          this.cdr.detectChanges();
          alert('Test deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting test:', error);
          alert('Failed to delete test. Please try again.');
        }
      });
    }
  }

  exportTests(): void {
    if (this.filteredTests.length === 0) {
      alert('No tests to export');
      return;
    }
    this.viewTestsService.exportTestsToJson(this.filteredTests);
  }

  exportTestsCsv(): void {
    if (this.filteredTests.length === 0) {
      alert('No tests to export');
      return;
    }
    this.viewTestsService.exportTestsToCsv(this.filteredTests);
  }

  // Template helper methods - Fixed to use correct status property
  getStatusClass(status: string): string {
    console.log('Getting status class for:', status);
    return `status-${status.toLowerCase()}`;
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  formatDate(dateString: string): Date {
    return new Date(dateString);
  }

  // Status check methods - Fixed to use testRunStatus
  isTestRunning(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'RUNNING';
  }

  isTestScheduled(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'SCHEDULED';
  }

  isTestCompleted(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'COMPLETED';
  }

  isTestFailed(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'FAILED';
  }

  canStopTest(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'RUNNING';
  }

  canCancelTest(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'SCHEDULED';
  }

  canRetryTest(test: LoadTestDisplay): boolean {
    return test.testRunStatus === 'FAILED';
  }

  // Helper methods for template
  getProjectOptions(): string[] {
    const projects = [...new Set(this.allTests.map(test => test.project.name))];
    return projects.sort();
  }

  getTypeOptions(): string[] {
    const types = [...new Set(this.allTests.map(test => test.type))];
    return types.sort();
  }

  // Status display methods - Use actual backend status
  getStatusDisplayText(status: string): string {
    console.log('Getting display text for status:', status);
    return status || 'UNKNOWN';
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status.toLowerCase();
    return `status-badge status-${statusLower}`;
  }

  // Debug method for template
  debugTest(test: LoadTestDisplay): void {
    console.log('Debug test object:', test);
    console.log('Test status:', test.testRunStatus);
    console.log('Test status (legacy):', test.status);
  }
}
