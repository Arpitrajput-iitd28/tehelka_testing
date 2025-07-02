import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout';

@Component({
  selector: 'app-create-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LayoutComponent],
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
    private router: Router
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
    // Implement save as draft logic
    alert('Test saved as draft!');
  }

  createTest(): void {
    if (this.createTestForm.valid) {
      this.isCreating = true;
      console.log('Creating test:', this.createTestForm.value);
      
      // Simulate API call
      setTimeout(() => {
        this.isCreating = false;
        alert('Test created successfully!');
        this.router.navigate(['/tests']);
      }, 2000);
    }
  }
}
