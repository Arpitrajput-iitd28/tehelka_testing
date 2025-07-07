import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { CreateTestService, TestRequest, Project } from './create-test-service';

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LayoutComponent, HttpClientModule],
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
  
  // Project data
  projects: Project[] = [];
  selectedProjectId: number | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private createTestService: CreateTestService
  ) {
    this.createTestForm = this.formBuilder.group({
      testName: ['', Validators.required],
      projectId: ['', Validators.required],
      comments: [''],
      testType: ['load', Validators.required],
      action: ['Load Test'],
      thread: ['Thread Group'],
      virtualUsers: [10, [Validators.required, Validators.min(1), Validators.max(10000)]],
      duration: [5, [Validators.required, Validators.min(1), Validators.max(1440)]],
      rampUpTime: [30, [Validators.required, Validators.min(1)]],
      loop: [1, [Validators.required, Validators.min(1)]],
      startdelay: [0, [Validators.min(0)]],
      startupTime: [10, [Validators.required, Validators.min(1)]],
      holdLoadFor: [300, [Validators.required, Validators.min(1)]],
      shutdownTime: [10, [Validators.required, Validators.min(1)]],
      startThreadCount: [1, [Validators.required, Validators.min(1)]],
      initialDelay: [0, [Validators.min(0)]],
      scheduleTime: ['']
    });
  }

  ngOnInit(): void {
    console.log('Create Test component initialized');
    this.loadProjects();
  }

  // Load available projects
  loadProjects(): void {
    this.isLoadingProjects = true;
    this.createTestService.getAllProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.isLoadingProjects = false;
        console.log('Projects loaded:', projects);
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoadingProjects = false;
        alert('Failed to load projects. Please refresh the page.');
      }
    });
  }

  onProjectChange(): void {
    this.selectedProjectId = parseInt(this.createTestForm.get('projectId')?.value);
    console.log('Selected project ID:', this.selectedProjectId);
  }

  onTestTypeChange(): void {
    const testType = this.createTestForm.get('testType')?.value;
    const actionMap: { [key: string]: string } = {
      'load': 'Load Test',
      'stress': 'Stress Test',
      'spike': 'Spike Test',
      'volume': 'Volume Test'
    };
    
    this.createTestForm.patchValue({
      action: actionMap[testType] || 'Load Test'
    });
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
      // Validate file type
      const allowedExtensions = ['jmx', 'pdf'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension || '')) {
        alert('Only .jmx and .pdf files are allowed');
        return;
      }
      
      this.selectedFile = file;
      console.log('File selected:', file.name);
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
      
      // Validate file type
      const allowedExtensions = ['jmx', 'pdf'];
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension || '')) {
        alert('Only .jmx and .pdf files are allowed');
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
      alert('Please fill in all required fields');
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
    
    // Convert form data to TestRequest
    const testRequest: TestRequest = this.createTestService.convertFormToTestRequest(
      this.createTestForm.value
    );

    console.log('Sending test request:', testRequest);
    console.log('Selected project ID:', this.selectedProjectId);
    console.log('Selected file:', this.selectedFile.name);

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
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error (${error.status}): ${errorMessage}`);
      }
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createTestForm.controls).forEach(key => {
      const control = this.createTestForm.get(key);
      control?.markAsTouched();
    });
  }
}
