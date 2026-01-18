package ru.socialmap.controller;
import org.springframework.web.bind.annotation.*;
import ru.socialmap.model.User;
import ru.socialmap.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.HashMap;
import java.util.Map;
@RestController
@RequestMapping("/api/auth")
@CrossOrigin
public class AuthController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        if (userRepository.findByEmail(user.getEmail()) != null) {
            response.put("error", "Email уже зарегистрирован");
            return response;
        }
        if (user.getBenefitCategory() == null || user.getBenefitCategory().trim().isEmpty()) {
            response.put("error", "Категория льготника обязательна");
            return response;
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");
        User savedUser = userRepository.save(user);
        response.put("message", "Регистрация успешна");
        response.put("user", Map.of(
                "id", savedUser.getId(),
                "fullName", savedUser.getFullName(),
                "email", savedUser.getEmail(),
                "benefitCategory", savedUser.getBenefitCategory()
        ));
        return response;
    }
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        String email = credentials.get("email");
        String password = credentials.get("password");
        User user = userRepository.findByEmail(email);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            response.put("message", "Вход выполнен");
            response.put("user", Map.of(
                    "id", user.getId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "benefitCategory", user.getBenefitCategory() != null ? user.getBenefitCategory() : "",
                    "address", user.getAddress() != null ? user.getAddress() : ""
            ));
        } else {
            response.put("error", "Неверный email или пароль");
        }
        return response;
    }
    @GetMapping("/me")
    public Map<String, Object> getMe(@RequestParam Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("error", "Пользователь не найден");
        }
        return Map.of(
                "id", user.getId(),
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "benefitCategory", user.getBenefitCategory() != null ? user.getBenefitCategory() : "",
                "address", user.getAddress() != null ? user.getAddress() : ""
        );
    }
    @PostMapping("/update")
    public Map<String, String> updateProfile(@RequestBody User updatedUser) {
        Map<String, String> response = new HashMap<>();
        User user = userRepository.findById(updatedUser.getId()).orElse(null);
        if (user == null) {
            response.put("error", "Пользователь не найден");
            return response;
        }
        if (updatedUser.getFullName() != null && !updatedUser.getFullName().trim().isEmpty()) {
            user.setFullName(updatedUser.getFullName().trim());
        }
        if (updatedUser.getBenefitCategory() != null) {
            user.setBenefitCategory(updatedUser.getBenefitCategory());
        }
        if (updatedUser.getAddress() != null) {
            user.setAddress(updatedUser.getAddress().trim());
        }
        userRepository.save(user);
        response.put("message", "Профиль успешно обновлён");
        return response;
    }
}