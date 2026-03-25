package com.resumeAnlayazer.backend.service.impl;

import com.resumeAnlayazer.backend.model.HRUserModel;
import com.resumeAnlayazer.backend.repository.HRUserRepository;
import com.resumeAnlayazer.backend.service.HRUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HRUserServiceImpl implements HRUserService {

    private final HRUserRepository hrUserRepository;
    private final PasswordEncoder passwordEncoder; //  inject encoder

    public HRUserServiceImpl(HRUserRepository hrUserRepository, PasswordEncoder passwordEncoder) {
        this.hrUserRepository = hrUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public HRUserModel registerUser(HRUserModel hrUserModel) {
        if (hrUserRepository.existsByEmail(hrUserModel.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        //  Hash password before saving
        hrUserModel.setPassword(passwordEncoder.encode(hrUserModel.getPassword()));
        return hrUserRepository.save(hrUserModel);
    }

    @Override
    public Optional<HRUserModel> loginUser(String email, String password) {
        Optional<HRUserModel> userOpt = hrUserRepository.findByEmail(email);

        //  Compare hashed password using BCrypt
        if (userOpt.isPresent()) {
            HRUserModel user = userOpt.get();
            if (passwordEncoder.matches(password, user.getPassword())) {
                return Optional.of(user);
            }
        }

        return Optional.empty();
    }

    @Override
    public List<HRUserModel> getAllUsers() {
        return hrUserRepository.findAll();
    }

    @Override
    public Optional<HRUserModel> getUserById(Long id) {
        return hrUserRepository.findById(id);
    }
}
