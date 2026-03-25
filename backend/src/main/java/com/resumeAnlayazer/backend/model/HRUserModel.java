package com.resumeAnlayazer.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@Entity
@Table(name = "hr_users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HRUserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 2, max = 50)
    private String name;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email can't be blank")
    @Column(unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, max = 100)
    private String password;

    @NotBlank(message = "Company name cannot be empty")
    @Size(min = 2, max = 100)
    private String companyName;
}
