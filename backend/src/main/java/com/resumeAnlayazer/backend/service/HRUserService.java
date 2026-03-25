package com.resumeAnlayazer.backend.service;

import com.resumeAnlayazer.backend.model.HRUserModel;

import java.util.List;
import java.util.Optional;

public interface HRUserService {
    HRUserModel registerUser(HRUserModel hrUserModel);
    Optional<HRUserModel> loginUser(String email, String password);
    List<HRUserModel> getAllUsers();
    Optional<HRUserModel> getUserById(Long id);
}
