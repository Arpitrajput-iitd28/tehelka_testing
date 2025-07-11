import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { CreateTestService, TestRequest, Project } from './create-test-service';

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LayoutComponent],
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
  
  projects: Project[] = [];
  selectedProjectId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private createTestService: CreateTestService,
    private cdr: ChangeDetectorRef
  ) {
    // Single FormGroup initialization with consistent field names
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
  
  // Updated FormGroup with correct control names that match your template
  this.createTestForm = this.formBuilder.group({
    testName: ['', [Validators.required, Validators.minLength(3)]],
    projectId: ['', Validators.required],
    comments: [''],
    testType: ['load', Validators.required],
    action: ['START', Validators.required],
    thread: ['THREAD', Validators.required],
    
    // These names must match your template exactly
    virtualUsers: [10, [Validators.required, Validators.min(1), Validators.max(10000)]],
    duration: [60, [Validators.required, Validators.min(1), Validators.max(86400)]],
    rampUpTime: [5, [Validators.required, Validators.min(1)]],
    
    loop: [1, [Validators.required, Validators.min(1)]],
    startdelay: [0, [Validators.min(0)]],
    startupTime: [5, [Validators.required, Validators.min(1)]],
    holdLoadFor: [30, [Validators.required, Validators.min(1)]],
    shutdownTime: [5, [Validators.required, Validators.min(1)]],
    startThreadCount: [2, [Validators.required, Validators.min(1)]],
    initialDelay: [0, [Validators.min(0)]],
    scheduleTime: ['']
  });
  
  this.loadProjects();
}

  loadProjects(): void {
  this.isLoadingProjects = true;
  
  this.createTestService.getAllProjects().subscribe({
    next: (projects) => {
      console.log('Projects loaded successfully:', projects);
      
      // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
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
        
        // Manually trigger change detection
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
    // Update action based on test type if needed
    this.createTestForm.patchValue({ action: 'START' });
  }

  onScheduleTypeChange(type: string): void {
    this.selectedScheduleType = type;
    console.log('Schedule type changed to:', type);
    
    if (type === 'now') {
      this.createTestForm.patchValue({ scheduleTime: '' });
    }
  }

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

  saveAsDraft(): void {
    console.log('Saving test as draft:', this.createTestForm.value);
    alert('Draft functionality will be implemented in future updates');
  }

  createTest(): void {
    if (!this.createTestForm.valid) {
      this.markFormGroupTouched();
      this.showValidationErrors();
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
    
    // Use the service conversion method for consistency
    const testRequest: TestRequest = this.createTestService.convertFormToTestRequest(
      this.createTestForm.value
    );

    // Add scheduled execution time if scheduled
    if (this.selectedScheduleType === 'scheduled' && this.createTestForm.value.scheduleTime) {
      try {
        testRequest.scheduledExecutionTime = new Date(this.createTestForm.value.scheduleTime).toISOString();
      } catch (error) {
        console.warn('Invalid schedule time:', error);
        alert('Invalid schedule time format. Please select a valid date and time.');
        this.isCreating = false;
        return;
      }
    }

    console.log('=== CREATE TEST DEBUG ===');
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
        }
        
        alert(`Error: ${errorMessage}`);
      }
    });
  }

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

  // Helper methods for template
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
}
