import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LayoutComponent } from  '../../shared/layout/layout';

interface LoadTest {
  id: string;
  name: string;
  projectName: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
  startTime: Date;
  duration?: string;
  virtualUsers: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LayoutComponent],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  // Dashboard stats
  totalTests = 25;
  runningTests = 3;
  completedTests = 20;
  failedTests = 2;

  // Tests data
  allTests: LoadTest[] = [];
  filteredTests: LoadTest[] = [];
  statusFilter = '';

  // UI state
  showCreateTestModal = false;
  
  // Forms
  createTestForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.createTestForm = this.formBuilder.group({
      testName: ['', Validators.required],
      projectName: ['', Validators.required],
      githubUrl: [''],
      virtualUsers: [10, [Validators.required, Validators.min(1)]],
      duration: [5, [Validators.required, Validators.min(1)]],
      scheduleTime: ['']
    });
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadTests();
  }

  loadDashboardData(): void {
    // Mock data - replace with actual API calls
    this.totalTests = 25;
    this.runningTests = 3;
    this.completedTests = 20;
    this.failedTests = 2;
  }

  loadTests(): void {
    // Mock data - replace with actual API calls
    this.allTests = [
      {
        id: '1',
        name: 'API Performance Test',
        projectName: 'E-commerce API',
        status: 'COMPLETED',
        startTime: new Date('2025-07-01T10:30:00'),
        duration: '5m 23s',
        virtualUsers: 100
      },
      {
        id: '2',
        name: 'Database Stress Test',
        projectName: 'User Management',
        status: 'RUNNING',
        startTime: new Date('2025-07-01T14:15:00'),
        virtualUsers: 50
      },
      {
        id: '3',
        name: 'Frontend Load Test',
        projectName: 'Dashboard UI',
        status: 'SCHEDULED',
        startTime: new Date('2025-07-01T16:00:00'),
        virtualUsers: 200
      },
      {
        id: '4',
        name: 'Authentication Service Test',
        projectName: 'Auth Service',
        status: 'FAILED',
        startTime: new Date('2025-07-01T12:00:00'),
        duration: '2m 15s',
        virtualUsers: 75
      },
      {
        id: '5',
        name: 'Payment Gateway Test',
        projectName: 'Payment System',
        status: 'COMPLETED',
        startTime: new Date('2025-07-01T09:45:00'),
        duration: '8m 42s',
        virtualUsers: 150
      }
    ];
    this.filteredTests = [...this.allTests];
  }

  filterTests(): void {
    if (this.statusFilter) {
      this.filteredTests = this.allTests.filter(test => test.status === this.statusFilter);
    } else {
      this.filteredTests = [...this.allTests];
    }
  }

  createTest(): void {
    if (this.createTestForm.valid) {
      const formData = this.createTestForm.value;
      console.log('Creating test:', formData);
      
      // Create new test object
      const newTest: LoadTest = {
        id: (this.allTests.length + 1).toString(),
        name: formData.testName,
        projectName: formData.projectName,
        status: formData.scheduleTime ? 'SCHEDULED' : 'RUNNING',
        startTime: formData.scheduleTime ? new Date(formData.scheduleTime) : new Date(),
        virtualUsers: formData.virtualUsers
      };

      // Add to tests array
      this.allTests.unshift(newTest);
      this.filterTests();
      
      // Update stats
      this.totalTests++;
      if (newTest.status === 'SCHEDULED') {
        // Will be handled by scheduler
      } else {
        this.runningTests++;
      }
      
      // Close modal and reset form
      this.showCreateTestModal = false;
      this.createTestForm.reset({
        virtualUsers: 10,
        duration: 5
      });
      
      console.log('Test created successfully!');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('File selected:', file.name);
      // Handle file upload logic here
      // You can add file validation, upload to server, etc.
    }
  }

  viewReport(testId: string): void {
    console.log('Viewing report for test:', testId);
    this.router.navigate(['/reports', testId]);
  }

  stopTest(testId: string): void {
    console.log('Stopping test:', testId);
    
    // Find and update the test
    const testIndex = this.allTests.findIndex(test => test.id === testId);
    if (testIndex !== -1) {
      this.allTests[testIndex].status = 'FAILED';
      this.allTests[testIndex].duration = '2m 30s'; // Mock duration
      
      // Update stats
      this.runningTests--;
      this.failedTests++;
      
      this.filterTests();
      console.log('Test stopped successfully');
    }
  }

  cancelTest(testId: string): void {
    console.log('Cancelling test:', testId);
    
    // Remove the test from the list
    this.allTests = this.allTests.filter(test => test.id !== testId);
    this.totalTests--;
    
    this.filterTests();
    console.log('Test cancelled successfully');
  }

  closeModal(event: Event): void {
    if (event.target === event.currentTarget) {
      this.showCreateTestModal = false;
    }
  }

  // Method to open create test modal (can be called from sidebar)
  openCreateTestModal(): void {
    this.showCreateTestModal = true;
  }
}
