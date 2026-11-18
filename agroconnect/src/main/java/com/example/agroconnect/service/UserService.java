package com.example.agroconnect.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.example.agroconnect.model.User;
import com.example.agroconnect.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) { this.userRepository = userRepository; }

    public User registerUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank() || user.getPassword() == null || user.getPassword().length() < 8)
            throw new RuntimeException("Email is required and password must be at least 8 characters");
        if (userRepository.findByEmail(user.getEmail()).isPresent()) throw new RuntimeException("Email already registered");
        user.setRole("USER");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Invalid email or password"));
        String stored = user.getPassword();
        boolean valid = stored != null && (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))
                ? passwordEncoder.matches(password, stored) : stored != null && stored.equals(password);
        if (!valid) throw new RuntimeException("Invalid email or password");
        // Migrate older plaintext passwords after successful login.
        if (stored != null && !(stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$"))) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }
        return user;
    }

    public User createAdmin(User user) {
        if (user.getEmail() == null || user.getPassword() == null || user.getPassword().length() < 8)
            throw new RuntimeException("Email is required and password must be at least 8 characters");
        if (userRepository.findByEmail(user.getEmail()).isPresent()) throw new RuntimeException("Email already registered");
        user.setRole("ADMIN");
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
}
