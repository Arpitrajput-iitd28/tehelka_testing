package com.load.Service;

import com.load.Model.Project;
import com.load.Repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // Get all projects
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    // Get a single project by ID
    public Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
    }

    // Delete a project by ID
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    // Create a new project (just the name)
    public Project createProject(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("Project name is required.");
        }
        Project project = new Project();
        project.setName(name.trim());
        project.setCreatedAt(LocalDateTime.now());
        return projectRepository.save(project);
    }
}

