import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../../shared/layout/layout';

interface TeamMember {
  email: string;
  role: 'viewer' | 'tester' | 'admin';
}

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
    private router: Router
  ) {
    this.createProjectForm = this.formBuilder.group({
      projectName: ['', Validators.required],
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

  onProjectKeyChange(): void {
    const projectKey = this.createProjectForm.get('projectKey')?.value;
    if (projectKey) {
      this.createProjectForm.patchValue({
        projectKey: projectKey.toUpperCase()
      });
    }
  }

  addTeamMember(): void {
    if (this.newMemberEmail && this.isValidEmail(this.newMemberEmail)) {
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  saveAsDraft(): void {
    console.log('Saving project as draft:', this.createProjectForm.value);
    console.log('Team members:', this.teamMembers);
    // Implement save as draft logic
    alert('Project saved as draft!');
  }

  createProject(): void {
    if (this.createProjectForm.valid) {
      this.isCreating = true;
      
      const projectData = {
        ...this.createProjectForm.value,
        teamMembers: this.teamMembers
      };
      
      console.log('Creating project:', projectData);
      
      // Simulate API call
      setTimeout(() => {
        this.isCreating = false;
        alert('Project created successfully!');
        this.router.navigate(['/projects']);
      }, 2000);
    } else {
      console.log('Form is invalid');
      this.markFormGroupTouched();
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
