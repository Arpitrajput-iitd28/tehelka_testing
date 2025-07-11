import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LayoutComponent } from '../../../shared/layout/layout';
import { CreateProjectService, CreateProjectFormData, TeamMember } from './create-project-service';

@Component({
  selector: 'app-create-project',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, LayoutComponent],
  templateUrl: './create-project.html',
  styleUrls: ['./create-project.css']
})
export class CreateProjectComponent implements OnInit {
  createProjectForm: FormGroup;
  teamMembers: TeamMember[] = [];
  newMemberEmail = '';
  newMemberRole: 'viewer' | 'tester' | 'admin' = 'tester';
  isCreating = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private createProjectService: CreateProjectService
  ) {
    this.createProjectForm = this.formBuilder.group({
      projectName: ['', [Validators.required, Validators.minLength(3)]],
      projectKey: ['', [Validators.required, Validators.pattern(/^[A-Z]{3,10}$/)]],
      description: [''],
      category: [''],
      priority: ['medium'],
      environments: this.formBuilder.array([this.createEnvironmentGroup()]),
      projectLead: [''],
      visibility: ['private'],
      emailNotifications: [true],
      slackNotifications: [false],
      slackWebhook: [''],
      defaultTestDuration: [5],
      maxConcurrentTests: [3],
      retentionPeriod: [90],
      autoCleanup: [false]
    });
  }

  ngOnInit(): void {
    console.log('Create Project component initialized');
  }

  get environments(): FormArray {
    return this.createProjectForm.get('environments') as FormArray;
  }

  createEnvironmentGroup(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      baseUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      description: ['']
    });
  }

  addEnvironment(): void {
    this.environments.push(this.createEnvironmentGroup());
  }

  removeEnvironment(index: number): void {
    if (this.environments.length > 1) {
      this.environments.removeAt(index);
    }
  }

  onProjectNameChange(): void {
    const projectName = this.createProjectForm.get('projectName')?.value;
    if (projectName) {
      const generatedKey = this.createProjectService.generateProjectKey(projectName);
      this.createProjectForm.patchValue({
        projectKey: generatedKey
      });
    }
  }

  onProjectKeyChange(): void {
    const projectKey = this.createProjectForm.get('projectKey')?.value;
    if (projectKey) {
      this.createProjectForm.patchValue({
        projectKey: projectKey.toUpperCase()
      });
    }
  }

  addTeamMember(): void {
    if (this.newMemberEmail && this.createProjectService.validateEmail(this.newMemberEmail)) {
      const existingMember = this.teamMembers.find(m => m.email === this.newMemberEmail);
      if (!existingMember) {
        this.teamMembers.push({
          email: this.newMemberEmail,
          role: this.newMemberRole
        });
        this.newMemberEmail = '';
        this.newMemberRole = 'tester';
      } else {
        alert('This team member is already added');
      }
    } else {
      alert('Please enter a valid email address');
    }
  }

  removeTeamMember(index: number): void {
    this.teamMembers.splice(index, 1);
  }

  saveAsDraft(): void {
    const formData: CreateProjectFormData = {
      ...this.createProjectForm.value,
      teamMembers: this.teamMembers
    };

    this.createProjectService.saveProjectAsDraft(formData).subscribe({
      next: (response: any) => {
        console.log('Draft saved:', response);
        alert('Project saved as draft!');
      },
      error: (error: any) => {
        console.error('Error saving draft:', error);
        alert('Failed to save draft. Please try again.');
      }
    });
  }

  createProject(): void {
    if (this.createProjectForm.valid) {
      this.isCreating = true;
      
      const formData: CreateProjectFormData = {
        ...this.createProjectForm.value,
        teamMembers: this.teamMembers
      };
      
      console.log('Creating project with data:', formData);
      
      this.createProjectService.createProject(formData).subscribe({
        next: (project: { name: any; }) => {
          console.log('Project created successfully:', project);
          this.isCreating = false;
          alert(`Project "${project.name}" created successfully!`);
          this.router.navigate(['/projects']);
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error creating project:', error);
          this.isCreating = false;
          
          let errorMessage = 'Failed to create project.';
          if (error.status === 0) {
            errorMessage = 'Cannot connect to server. Please check your connection.';
          } else if (error.status === 400) {
            errorMessage = 'Invalid project data. Please check all required fields.';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'Authentication required. Please log in again.';
          } else if (error.status === 409) {
            errorMessage = 'A project with this name already exists.';
          }
          
          alert(`Error: ${errorMessage}`);
        }
      });
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
      alert('Please fill in all required fields correctly.');
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.createProjectForm.controls).forEach(key => {
      const control = this.createProjectForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(arrayKey => {
              arrayControl.get(arrayKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }
}
