import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout';

interface LoadTest {
  id: string;
  name: string;
  description?: string;
  project: string;
  type: 'load' | 'stress' | 'spike' | 'volume';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED' | 'DRAFT';
  startTime: Date;
  duration?: string;
  virtualUsers: number;
  successRate: number | null;
  targetUrl: string;
  createdBy: string;
  createdAt: Date;
}

@Component({
  selector: 'app-view-tests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './view-tests.html',
  styleUrls: ['./view-tests.css']
})
export class ViewTestsComponent implements OnInit {
  // Data properties
  allTests: LoadTest[] = [];
  filteredTests: LoadTest[] = [];
  paginatedTests: LoadTest[] = [];
  
  // Filter properties
  searchQuery = '';
  statusFilter = '';
  projectFilter = '';
  typeFilter = '';
  
  // Sorting properties
  sortField = 'startTime';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // UI state
  isRefreshing = false;
  Math = Math; // Make Math available in template

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTests();
  }

  // API Integration Point - Replace with actual HTTP service call
  loadTests(): void {
    // Mock data - replace with actual API call
    this.allTests = [
      {
        id: '1',
        name: 'API Performance Baseline',
        description: 'Baseline performance test for user authentication API',
        project: 'ecommerce',
        type: 'load',
        status: 'COMPLETED',
        startTime: new Date('2025-07-01T10:30:00'),
        duration: '5m 23s',
        virtualUsers: 100,
        successRate: 98.5,
        targetUrl: 'https://api.ecommerce.com/auth',
        createdBy: 'john.doe@company.com',
        createdAt: new Date('2025-07-01T09:00:00')
      },
      {
        id: '2',
        name: 'Database Stress Test',
        description: 'High-load stress test for user management database',
        project: 'auth',
        type: 'stress',
        status: 'RUNNING',
        startTime: new Date('2025-07-02T14:15:00'),
        virtualUsers: 500,
        successRate: null,
        targetUrl: 'https://api.auth.com/users',
        createdBy: 'jane.smith@company.com',
        createdAt: new Date('2025-07-02T13:00:00')
      },
      {
        id: '3',
        name: 'Payment Gateway Load Test',
        project: 'payment',
        type: 'load',
        status: 'FAILED',
        startTime: new Date('2025-07-01T16:00:00'),
        duration: '2m 15s',
        virtualUsers: 200,
        successRate: 45.2,
        targetUrl: 'https://api.payment.com/process',
        createdBy: 'mike.wilson@company.com',
        createdAt: new Date('2025-07-01T15:30:00')
      },
      {
        id: '4',
        name: 'Dashboard UI Performance',
        description: 'Frontend load test for dashboard components',
        project: 'dashboard',
        type: 'load',
        status: 'SCHEDULED',
        startTime: new Date('2025-07-03T09:00:00'),
        virtualUsers: 150,
        successRate: null,
        targetUrl: 'https://dashboard.company.com',
        createdBy: 'sarah.jones@company.com',
        createdAt: new Date('2025-07-02T16:00:00')
      },
      {
        id: '5',
        name: 'Spike Test - Black Friday',
        description: 'Spike test simulation for Black Friday traffic',
        project: 'ecommerce',
        type: 'spike',
        status: 'DRAFT',
        startTime: new Date('2025-07-05T12:00:00'),
        virtualUsers: 1000,
        successRate: null,
        targetUrl: 'https://api.ecommerce.com',
        createdBy: 'admin@company.com',
        createdAt: new Date('2025-07-02T10:00:00')
      }
    ];
    
    this.applyFilters();
  }

  // API Integration Point - Replace with actual HTTP service call
  refreshTests(): void {
    this.isRefreshing = true;
    // Simulate API call
    setTimeout(() => {
      this.loadTests();
      this.isRefreshing = false;
    }, 1000);
  }

  // Filter and Search Methods
  onSearch(): void {
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
    let filtered = [...this.allTests];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(test => 
        test.name.toLowerCase().includes(query) ||
        test.description?.toLowerCase().includes(query) ||
        test.project.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(test => test.status === this.statusFilter);
    }

    // Project filter
    if (this.projectFilter) {
      filtered = filtered.filter(test => test.project === this.projectFilter);
    }

    // Type filter
    if (this.typeFilter) {
      filtered = filtered.filter(test => test.type === this.typeFilter);
    }

    this.filteredTests = filtered;
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
    this.filteredTests.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof LoadTest];
      let bValue: any = b[this.sortField as keyof LoadTest];

      // Handle date sorting
      if (this.sortField === 'startTime') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      // Handle string sorting
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  // Pagination Methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredTests.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTests = this.filteredTests.slice(startIndex, endIndex);
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
    return this.allTests.filter(test => test.status === status).length;
  }

  trackByTestId(index: number, test: LoadTest): string {
    return test.id;
  }

  // Action Methods - API Integration Points
  viewReport(testId: string): void {
    console.log('Viewing report for test:', testId);
    // Navigate to report page or open modal
    this.router.navigate(['/reports', testId]);
  }

  stopTest(testId: string): void {
    console.log('Stopping test:', testId);
    // API call to stop test
    if (confirm('Are you sure you want to stop this test?')) {
      // Implement stop test API call
      const test = this.allTests.find(t => t.id === testId);
      if (test) {
        test.status = 'FAILED';
        test.duration = '2m 30s';
        this.applyFilters();
      }
    }
  }

  cancelTest(testId: string): void {
    console.log('Cancelling test:', testId);
    // API call to cancel scheduled test
    if (confirm('Are you sure you want to cancel this scheduled test?')) {
      this.allTests = this.allTests.filter(test => test.id !== testId);
      this.applyFilters();
    }
  }

  editTest(testId: string): void {
    console.log('Editing test:', testId);
    // Navigate to edit page
    this.router.navigate(['/tests/edit', testId]);
  }

  retryTest(testId: string): void {
    console.log('Retrying test:', testId);
    // API call to retry failed test
    if (confirm('Are you sure you want to retry this test?')) {
      const test = this.allTests.find(t => t.id === testId);
      if (test) {
        test.status = 'RUNNING';
        test.startTime = new Date();
        test.successRate = null;
        this.applyFilters();
      }
    }
  }

  duplicateTest(testId: string): void {
    console.log('Duplicating test:', testId);
    // Navigate to create page with pre-filled data
    this.router.navigate(['/tests/create'], { queryParams: { duplicate: testId } });
  }

  deleteTest(testId: string): void {
    console.log('Deleting test:', testId);
    // API call to delete test
    if (confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      this.allTests = this.allTests.filter(test => test.id !== testId);
      this.applyFilters();
    }
  }

  exportTests(): void {
    console.log('Exporting tests');
    // Implement export functionality
    alert('Export functionality will be implemented with API integration');
  }
}
