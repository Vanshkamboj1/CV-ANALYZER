package com.resumeAnlayazer.backend.controller;

import com.resumeAnlayazer.backend.dto.AuthResponseDTO;
import com.resumeAnlayazer.backend.dto.HRUserRequestDTO;
import com.resumeAnlayazer.backend.dto.HRUserResponseDTO;
import com.resumeAnlayazer.backend.model.HRUserModel;
import com.resumeAnlayazer.backend.service.HRUserService;
import com.resumeAnlayazer.backend.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/hrusers")
public class HRUserController {

    private final HRUserService hrUserService;
    private final JwtUtil jwtUtil;

    public HRUserController(HRUserService hrUserService, JwtUtil jwtUtil) {
        this.hrUserService = hrUserService;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody HRUserRequestDTO dto) {
        try {
            HRUserModel model = new HRUserModel();
            model.setName(dto.getName());
            model.setEmail(dto.getEmail());
            model.setPassword(dto.getPassword());
            model.setCompanyName(dto.getCompanyName());

            HRUserModel saved = hrUserService.registerUser(model);
            HRUserResponseDTO response = HRUserResponseDTO.fromModel(saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Something went wrong: " + e.getMessage());
        }
    }

    // ✅ LOGIN USER (JWT integrated)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody HRUserRequestDTO dto) {
        Optional<HRUserModel> user = hrUserService.loginUser(dto.getEmail(), dto.getPassword());

        if (user.isPresent()) {
            HRUserModel hr = user.get();

            // Generate JWT tokens
            String accessToken = jwtUtil.generateAccessToken(hr.getId(), hr.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(hr.getId());

            // Build DTOs
            HRUserResponseDTO userResponse = HRUserResponseDTO.fromModel(hr);
            AuthResponseDTO response = new AuthResponseDTO(
                    userResponse,
                    accessToken,
                    refreshToken,
                    "Login successful"
            );

            return ResponseEntity.ok(response);

        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }


    // ✅ GET ALL USERS
    @GetMapping
    public ResponseEntity<List<HRUserResponseDTO>> getAllUsers() {
        List<HRUserResponseDTO> list = hrUserService.getAllUsers()
                .stream()
                .map(HRUserResponseDTO::fromModel)
                .toList();
        return ResponseEntity.ok(list);
    }

    // ✅ GET USER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        Optional<HRUserModel> user = hrUserService.getUserById(id);

        if (user.isPresent()) {
            return ResponseEntity.ok(HRUserResponseDTO.fromModel(user.get()));
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "User not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}
