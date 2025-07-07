import { ApplicationRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout';
import { ViewTestsService, LoadTestDisplay } from './view-tests-service';
import { ChangeDetectorRef } from '@angular/core';

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
  Math = Math; // Make Math available in template

  constructor(
    private router: Router,
    private viewTestsService: ViewTestsService,
  ) {}

  ngOnInit(): void {
    this.loadTests();
  }

  // Load tests from API
  loadTests(): void {
    this.isLoading = true;
    this.viewTestsService.getAllScheduledTests().subscribe({
      next: (tests) => {
        console.log('Raw tests from API:', tests);
        this.allTests = this.viewTestsService.transformTestsForDisplay(tests);
        console.log('Transformed tests:', this.allTests);
        this.isLoading = false;
        
        // Use setTimeout to trigger change detection - no injection needed
        setTimeout(() => {
          this.applyFilters();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.isLoading = false;
      }
    });
  }

  // Refresh tests
  refreshTests(): void {
    this.isRefreshing = true;
    this.viewTestsService.getAllScheduledTests().subscribe({
      next: (tests) => {
        this.allTests = this.viewTestsService.transformTestsForDisplay(tests);
        this.isRefreshing = false;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error refreshing tests:', error);
        this.isRefreshing = false;
        alert('Failed to refresh tests. Please try again.');
      }
    });
  }

  // Filter and Search Methods
  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.projectFilter = '';
    this.typeFilter = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters(): void {
    // Use service method for filtering
    this.filteredTests = this.viewTestsService.filterTests(
      this.allTests,
      this.searchQuery,
      this.statusFilter,
      this.projectFilter,
      this.typeFilter
    );

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
    // Use service method for sorting
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
    
    // Use service method for pagination
    this.paginatedTests = this.viewTestsService.paginateTests(
      this.filteredTests,
      this.currentPage,
      this.pageSize
    );
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
    return counts[status] || 0;
  }

  trackByTestId(index: number, test: LoadTestDisplay): number {
    return test.id;
  }

  // Action Methods - API Integration Points
  viewReport(testId: number): void {
    console.log('Viewing report for test:', testId);
    this.router.navigate(['/reports', testId]);
  }

  stopTest(testId: number): void {
    console.log('Stopping test:', testId);
    if (confirm('Are you sure you want to stop this test?')) {
      this.viewTestsService.stopTest(testId).subscribe({
        next: () => {
          console.log('Test stopped successfully');
          this.loadTests(); // Reload to get updated status
          alert('Test stopped successfully');
        },
        error: (error) => {
          console.error('Error stopping test:', error);
          alert('Failed to stop test. This feature may not be implemented yet.');
        }
      });
    }
  }

  cancelTest(testId: number): void {
    console.log('Cancelling test:', testId);
    if (confirm('Are you sure you want to cancel this scheduled test?')) {
      this.viewTestsService.cancelTest(testId).subscribe({
        next: () => {
          console.log('Test cancelled successfully');
          this.loadTests(); // Reload to remove cancelled test
          alert('Test cancelled successfully');
        },
        error: (error) => {
          console.error('Error cancelling test:', error);
          alert('Failed to cancel test. This feature may not be implemented yet.');
        }
      });
    }
  }

  editTest(testId: number): void {
    console.log('Editing test:', testId);
    this.router.navigate(['/tests/edit', testId]);
  }

  retryTest(testId: number): void {
    console.log('Retrying test:', testId);
    if (confirm('Are you sure you want to retry this test?')) {
      this.viewTestsService.retryTest(testId).subscribe({
        next: () => {
          console.log('Test retry initiated successfully');
          this.loadTests(); // Reload to get updated status
          alert('Test retry initiated successfully');
        },
        error: (error) => {
          console.error('Error retrying test:', error);
          alert('Failed to retry test. This feature may not be implemented yet.');
        }
      });
    }
  }

  duplicateTest(testId: number): void {
    console.log('Duplicating test:', testId);
    this.router.navigate(['/tests/create'], { queryParams: { duplicate: testId } });
  }

  deleteTest(testId: number): void {
    console.log('Deleting test:', testId);
    
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      // Find the test to get project ID
      const test = this.allTests.find(t => t.id === testId);
      if (!test) {
        alert('Test not found');
        return;
      }

      // Fix: Access project.id and pass both parameters
      this.viewTestsService.deleteTest(test.project.id, testId).subscribe({
        next: () => {
          console.log('Test deleted successfully');
          this.loadTests(); // Reload the list
          alert('Test deleted successfully');
        },
        error: (error: any) => {
          console.error('Error deleting test:', error);
          alert('Failed to delete test. Please try again.');
        }
      });
    }
  }


  exportTests(): void {
    console.log('Exporting tests');
    if (this.filteredTests.length === 0) {
      alert('No tests to export');
      return;
    }
    
    // Use service method for export
    this.viewTestsService.exportTestsToJson(this.filteredTests);
  }

  exportTestsCsv(): void {
    console.log('Exporting tests to CSV');
    if (this.filteredTests.length === 0) {
      alert('No tests to export');
      return;
    }
    
    // Use service method for CSV export
    this.viewTestsService.exportTestsToCsv(this.filteredTests);
  }

  // Additional helper methods for template
  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  formatDate(dateString: string): Date {
    return new Date(dateString);
  }

  isTestRunning(test: LoadTestDisplay): boolean {
    return test.status === 'RUNNING';
  }

  isTestScheduled(test: LoadTestDisplay): boolean {
    return test.status === 'SCHEDULED';
  }

  isTestCompleted(test: LoadTestDisplay): boolean {
    return test.status === 'COMPLETED';
  }

  isTestFailed(test: LoadTestDisplay): boolean {
    return test.status === 'FAILED';
  }

  canStopTest(test: LoadTestDisplay): boolean {
    return test.status === 'RUNNING';
  }

  canCancelTest(test: LoadTestDisplay): boolean {
    return test.status === 'SCHEDULED';
  }

  canRetryTest(test: LoadTestDisplay): boolean {
    return test.status === 'FAILED';
  }

  getProjectOptions(): string[] {
    const projects = [...new Set(this.allTests.map(test => test.project.name))];
    return projects.sort();
  }

  getTypeOptions(): string[] {
    const types = [...new Set(this.allTests.map(test => test.type))];
    return types.sort();
  }
}
