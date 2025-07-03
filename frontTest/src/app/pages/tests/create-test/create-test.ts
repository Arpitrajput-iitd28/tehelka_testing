import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { CreateTestService, LoadTestConfigRequest } from './create-test-service';

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LayoutComponent, HttpClientModule],
  templateUrl: './create-test.html',
  styleUrls: ['./create-test.css']
})
export class CreateTestComponent implements OnInit {
  createTestForm: FormGroup;
  selectedScriptType = 'simple';
  selectedScheduleType = 'now';
  selectedFile: File | null = null;
  isCreating = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadTestApiService: CreateTestService
  ) {
    this.createTestForm = this.formBuilder.group({
      testName: ['', Validators.required],
      projectName: ['', Validators.required],
      description: [''],
      testType: ['', Validators.required],
      targetUrl: ['', [Validators.required, Validators.pattern('https?://.+')]],
      virtualUsers: [10, [Validators.required, Validators.min(1), Validators.max(10000)]],
      duration: [5, [Validators.required, Validators.min(1), Validators.max(1440)]],
      rampUpTime: [30],
      thinkTime: [1],
      githubUrl: [''],
      scriptPath: [''],
      httpMethod: ['GET'],
      requestHeaders: ['{"Content-Type": "application/json"}'],
      requestBody: [''],
      scheduleTime: ['']
    });
  }

  ngOnInit(): void {
    console.log('Create Test component initialized');
  }

  onScriptTypeChange(type: string): void {
    this.selectedScriptType = type;
    console.log('Script type changed to:', type);
  }

  onScheduleTypeChange(type: string): void {
    this.selectedScheduleType = type;
    console.log('Schedule type changed to:', type);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
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
      this.selectedFile = files[0];
      console.log('File dropped:', this.selectedFile.name);
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  saveAsDraft(): void {
    console.log('Saving test as draft:', this.createTestForm.value);
    // Implement save as draft logic - could be a separate API endpoint
    alert('Test saved as draft!');
  }

  createTest(): void {
  if (this.createTestForm.valid) {
      this.isCreating = true;
      
      const apiRequest: LoadTestConfigRequest = this.loadTestApiService.convertFormToApiRequest(
        this.createTestForm.value, 
        this.selectedFile ?? undefined
      );

      console.log('Sending API request:', apiRequest);

      this.loadTestApiService.createLoadTestConfig(apiRequest).subscribe({
        next: (response) => {
          console.log('Test created successfully:', response);
          this.isCreating = false;
          alert(`Test "${response.fileName}" created successfully!`);
          this.router.navigate(['/tests']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Full error object:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          
          this.isCreating = false;
          
          // Show more detailed error message
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
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createTestForm.controls).forEach(key => {
      const control = this.createTestForm.get(key);
      control?.markAsTouched();
    });
  }
}
