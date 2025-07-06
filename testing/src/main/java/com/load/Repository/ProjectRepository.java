package com.load.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.load.Model.Project;

public interface ProjectRepository extends JpaRepository<Project, Long> {

}
