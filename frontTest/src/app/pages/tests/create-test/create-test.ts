import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { CreateTestService, TestRequest, Project } from './create-test-service';

export interface ThreadScheduleRow {
  startThreadsCount: number;
  initialDelay: number;
  startupTime: number;
  holdLoadFor: number;
  shutdownTime: number;
}

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './create-test.html',
  styleUrls: ['./create-test.css']
})
export class CreateTestComponent implements OnInit {
  createTestForm: FormGroup;
  selectedScriptType = 'upload';
  selectedScheduleType = 'now';
  selectedFile: File | null = null;
  isCreating = false;
  isLoadingProjects = true;
  selectedThreadType = 'standard';
  threadScheduleRows: ThreadScheduleRow[] = [];
  projects: Project[] = [];
  selectedProjectId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private createTestService: CreateTestService,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize FormGroup with all required fields
    this.createTestForm = this.formBuilder.group({
      testName: ['', [Validators.required, Validators.minLength(3)]],
      projectId: ['', Validators.required],
      comments: [''],
      testType: ['load', Validators.required],
      action: ['START', Validators.required],
      thread: ['THREAD', Validators.required],
      numUsers: [10, [Validators.required, Validators.min(1), Validators.max(10000)]],
      testDuration: [60, [Validators.required, Validators.min(1), Validators.max(86400)]],
      rampUpPeriod: [5, [Validators.required, Validators.min(1)]],
      loop: [1, [Validators.required, Validators.min(1)]],
      startdelay: [0, [Validators.min(0)]],
      startupTime: [5, [Validators.required, Validators.min(1)]],
      holdLoadFor: [30, [Validators.required, Validators.min(1)]],
      shutdownTime: [5, [Validators.required, Validators.min(1)]],
      startThreadCount: [2, [Validators.required, Validators.min(1)]],
      initialDelay: [0, [Validators.min(0)]],
      scheduleTime: ['']
    });
  }

  ngOnInit(): void {
    console.log('Create Test component initialized');
    this.initializeThreadSchedule();
    this.loadProjects();
  }

  // Thread Type Management
  onThreadTypeChange(type: string): void {
    this.selectedThreadType = type;
    console.log('Thread type changed to:', type);
    
    if (type === 'ultimate') {
      this.initializeThreadSchedule();
    }
    
    // Update form validation based on thread type
    this.updateFormValidation();
  }

  private updateFormValidation(): void {
    if (this.selectedThreadType === 'ultimate') {
      // For ultimate thread group, disable standard thread fields
      this.createTestForm.get('numUsers')?.disable();
      this.createTestForm.get('rampUpPeriod')?.disable();
      this.createTestForm.get('testDuration')?.disable();
    } else {
      // For standard thread group, enable standard thread fields
      this.createTestForm.get('numUsers')?.enable();
      this.createTestForm.get('rampUpPeriod')?.enable();
      this.createTestForm.get('testDuration')?.enable();
    }
  }

  initializeThreadSchedule(): void {
    this.threadScheduleRows = [
      {
        startThreadsCount: 10,
        initialDelay: 40,
        startupTime: 5050,
        holdLoadFor: 10,
        shutdownTime: 10
      }
    ];
  }

  // Ultimate Thread Group Table Management
  addThreadScheduleRow(): void {
    const newRow: ThreadScheduleRow = {
      startThreadsCount: 10,
      initialDelay: 0,
      startupTime: 10,
      holdLoadFor: 10,
      shutdownTime: 10
    };
    this.threadScheduleRows.push(newRow);
    console.log('Added new thread schedule row:', newRow);
  }

  copyRow(index: number): void {
    if (index >= 0 && index < this.threadScheduleRows.length) {
      const rowToCopy = { ...this.threadScheduleRows[index] };
      this.threadScheduleRows.splice(index + 1, 0, rowToCopy);
      console.log('Copied row at index:', index);
    }
  }

  deleteRow(index: number): void {
    if (this.threadScheduleRows.length > 1 && index >= 0 && index < this.threadScheduleRows.length) {
      this.threadScheduleRows.splice(index, 1);
      console.log('Deleted row at index:', index);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  // Calculate Ultimate Thread Group Summary
  getExpectedParallelUsers(): number {
    return this.threadScheduleRows.reduce((total, row) => 
      total + (row.startThreadsCount || 0), 0
    );
  }

  getTotalTestDuration(): number {
    let maxDuration = 0;
    
    this.threadScheduleRows.forEach(row => {
      const totalDuration = (row.initialDelay || 0) + 
                           (row.startupTime || 0) + 
                           (row.holdLoadFor || 0) + 
                           (row.shutdownTime || 0);
      maxDuration = Math.max(maxDuration, totalDuration);
    });
    
    return maxDuration;
  }

  // Project Management
  loadProjects(): void {
    this.isLoadingProjects = true;
    
    this.createTestService.getAllProjects().subscribe({
      next: (projects) => {
        console.log('Projects loaded successfully:', projects);
        
        setTimeout(() => {
          this.projects = projects;
          this.isLoadingProjects = false;
          
          if (projects.length > 0) {
            this.createTestForm.patchValue({ projectId: projects[0].id });
            this.selectedProjectId = projects[0].id;
            console.log('Auto-selected project:', projects[0]);
          } else {
            console.warn('No projects available - creating default project');
            this.createDefaultProject();
          }
          
          this.cdr.detectChanges();
        }, 0);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        setTimeout(() => {
          this.isLoadingProjects = false;
          this.createDefaultProject();
          this.cdr.detectChanges();
        }, 0);
      }
    });
  }

  createDefaultProject(): void {
    console.log('Creating default project');
    
    this.createTestService.createProject('Default Project').subscribe({
      next: (project) => {
        console.log('Default project created:', project);
        this.projects = [project];
        this.createTestForm.patchValue({ projectId: project.id });
        this.selectedProjectId = project.id;
        this.isLoadingProjects = false;
      },
      error: (error) => {
        console.error('Failed to create default project:', error);
        this.isLoadingProjects = false;
        alert('Failed to load or create projects. Please refresh the page.');
      }
    });
  }

  onProjectChange(): void {
    const projectIdValue = this.createTestForm.get('projectId')?.value;
    this.selectedProjectId = projectIdValue ? parseInt(projectIdValue) : null;
    console.log('Selected project ID:', this.selectedProjectId);
  }

  onTestTypeChange(): void {
    const testType = this.createTestForm.get('testType')?.value;
    console.log('Test type changed to:', testType);
    this.createTestForm.patchValue({ action: 'START' });
  }

  onScheduleTypeChange(type: string): void {
    this.selectedScheduleType = type;
    console.log('Schedule type changed to:', type);
    
    if (type === 'now') {
      this.createTestForm.patchValue({ scheduleTime: '' });
    }
  }

  // File Management
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validation = this.createTestService.validateFile(file);
      
      if (!validation.valid) {
        alert(validation.error);
        event.target.value = '';
        return;
      }
      
      this.selectedFile = file;
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validation = this.createTestService.validateFile(file);
      
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      
      this.selectedFile = file;
      console.log('File dropped:', this.selectedFile.name);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  // Test Creation
  saveAsDraft(): void {
    console.log('Saving test as draft:', this.createTestForm.value);
    alert('Draft functionality will be implemented in future updates');
  }

  createTest(): void {
    // Validate form based on thread type
    if (!this.validateFormForThreadType()) {
      return;
    }

    if (!this.selectedFile) {
      alert('Please select a JMX or PDF file');
      return;
    }

    if (!this.selectedProjectId) {
      alert('Please select a project');
      return;
    }

    this.isCreating = true;
    
    // Create test request with thread configuration
    const testRequest: TestRequest = this.buildTestRequest();

    console.log('=== CREATE TEST DEBUG ===');
    console.log('Thread Type:', this.selectedThreadType);
    console.log('Project ID:', this.selectedProjectId);
    console.log('Test Request:', testRequest);
    console.log('File:', {
      name: this.selectedFile.name,
      size: this.selectedFile.size,
      type: this.selectedFile.type
    });
    console.log('========================');

    this.createTestService.createTest(this.selectedProjectId, testRequest, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Test created successfully:', response);
        this.isCreating = false;
        alert(`Test "${response.testName}" created successfully!`);
        this.router.navigate(['/tests']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error creating test:', error);
        this.isCreating = false;
        this.handleCreateTestError(error);
      }
    });
  }

  private validateFormForThreadType(): boolean {
    if (this.selectedThreadType === 'standard') {
      // Validate standard thread group fields
      if (!this.createTestForm.valid) {
        this.markFormGroupTouched();
        this.showValidationErrors();
        return false;
      }
    } else {
      // Validate ultimate thread group
      if (!this.createTestForm.get('testName')?.valid || 
          !this.createTestForm.get('projectId')?.valid) {
        alert('Please fill in required fields: Test Name and Project');
        return false;
      }

      if (this.threadScheduleRows.length === 0) {
        alert('Please add at least one thread schedule row');
        return false;
      }

      // Validate thread schedule rows
      for (let i = 0; i < this.threadScheduleRows.length; i++) {
        const row = this.threadScheduleRows[i];
        if (!row.startThreadsCount || row.startThreadsCount < 1) {
          alert(`Row ${i + 1}: Start Threads Count must be at least 1`);
          return false;
        }
        if (row.startupTime < 1) {
          alert(`Row ${i + 1}: Startup Time must be at least 1 second`);
          return false;
        }
        if (row.holdLoadFor < 1) {
          alert(`Row ${i + 1}: Hold Load For must be at least 1 second`);
          return false;
        }
        if (row.shutdownTime < 1) {
          alert(`Row ${i + 1}: Shutdown Time must be at least 1 second`);
          return false;
        }
      }
    }
    return true;
  }

  private buildTestRequest(): TestRequest {
    const formValue = this.createTestForm.value;
    
    // Base test request
    const testRequest: TestRequest = this.createTestService.convertFormToTestRequest(formValue);

    // Add thread configuration based on selected type
    if (this.selectedThreadType === 'ultimate') {
      testRequest.threadType = 'ULTIMATE';
      testRequest.threadSchedule = this.threadScheduleRows;
      
      // For ultimate thread group, calculate totals
      testRequest.numUsers = this.getExpectedParallelUsers();
      testRequest.testDuration = this.getTotalTestDuration();
      testRequest.rampUpPeriod = 0; // Not applicable for ultimate thread group
    } else {
      testRequest.threadType = 'STANDARD';
      // Standard thread group uses form values (already set by convertFormToTestRequest)
    }

    // Add scheduled execution time if scheduled
    if (this.selectedScheduleType === 'scheduled' && formValue.scheduleTime) {
      try {
        testRequest.scheduledExecutionTime = new Date(formValue.scheduleTime).toISOString();
      } catch (error) {
        console.warn('Invalid schedule time:', error);
        alert('Invalid schedule time format. Please select a valid date and time.');
        throw error;
      }
    }

    return testRequest;
  }

  private handleCreateTestError(error: HttpErrorResponse): void {
    let errorMessage = 'Failed to create test.';
    
    if (error.status === 0) {
      errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.status === 400) {
      errorMessage = 'Invalid request. Please check all required fields.';
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = 'Authentication required. Please log in again.';
    } else if (error.status === 404) {
      errorMessage = 'Project not found. Please select a valid project.';
    } else if (error.status === 415) {
      errorMessage = 'Unsupported file type. Please upload a .jmx or .pdf file.';
    } else if (error.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    alert(`Error: ${errorMessage}`);
  }

  // Form Validation Helpers
  private markFormGroupTouched(): void {
    Object.keys(this.createTestForm.controls).forEach(key => {
      const control = this.createTestForm.get(key);
      control?.markAsTouched();
    });
  }

  private showValidationErrors(): void {
    const errors: string[] = [];
    
    Object.keys(this.createTestForm.controls).forEach(key => {
      const control = this.createTestForm.get(key);
      if (control && control.invalid && control.touched) {
        if (control.errors?.['required']) {
          errors.push(`${this.getFieldDisplayName(key)} is required`);
        }
        if (control.errors?.['minlength']) {
          errors.push(`${this.getFieldDisplayName(key)} must be at least ${control.errors['minlength'].requiredLength} characters`);
        }
        if (control.errors?.['min']) {
          errors.push(`${this.getFieldDisplayName(key)} must be at least ${control.errors['min'].min}`);
        }
        if (control.errors?.['max']) {
          errors.push(`${this.getFieldDisplayName(key)} must be at most ${control.errors['max'].max}`);
        }
      }
    });

    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
    }
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      testName: 'Test Name',
      projectId: 'Project',
      numUsers: 'Number of Users',
      testDuration: 'Test Duration',
      rampUpPeriod: 'Ramp Up Period',
      loop: 'Loop Count',
      startdelay: 'Start Delay',
      startupTime: 'Startup Time',
      holdLoadFor: 'Hold Load For',
      shutdownTime: 'Shutdown Time',
      startThreadCount: 'Start Thread Count',
      initialDelay: 'Initial Delay'
    };
    
    return displayNames[fieldName] || fieldName;
  }

  // Template Helper Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.createTestForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.createTestForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `Must be at least ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Must be at most ${field.errors['max'].max}`;
      }
    }
    return '';
  }

  // Thread Schedule Row Validation Helpers
  isRowValid(row: ThreadScheduleRow): boolean {
    return row.startThreadsCount > 0 && 
           row.startupTime > 0 && 
           row.holdLoadFor > 0 && 
           row.shutdownTime > 0;
  }

  getRowValidationMessage(row: ThreadScheduleRow): string {
    if (row.startThreadsCount <= 0) return 'Start Threads Count must be greater than 0';
    if (row.startupTime <= 0) return 'Startup Time must be greater than 0';
    if (row.holdLoadFor <= 0) return 'Hold Load For must be greater than 0';
    if (row.shutdownTime <= 0) return 'Shutdown Time must be greater than 0';
    return '';
  }
}
