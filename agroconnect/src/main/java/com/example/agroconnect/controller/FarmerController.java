package com.example.agroconnect.controller;

import com.example.agroconnect.model.Farmer;
import com.example.agroconnect.service.FarmerService;
import jakarta.servlet.http.HttpSession;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/farmer")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class FarmerController {

    private final FarmerService service;

    public FarmerController(FarmerService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> findAll(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        String role = (String) session.getAttribute("role");

        // Login check
        if (userId == null || role == null) {
            return ResponseEntity.status(401)
                    .body("Please login first");
        }

        // ADMIN → All farmers
        if (role.equals("ADMIN")) {
            return ResponseEntity.ok(service.findAll());
        }

        // USER → Own farmers only
        return ResponseEntity.ok(service.findByUserId(userId));
    }

    @GetMapping("/{id}")
    public Farmer findBYId(@PathVariable Long id) {
        return service.findById(id);
    }


    @PostMapping
    public ResponseEntity<?> save(
            @RequestBody Farmer farmer,
            HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return ResponseEntity.status(401)
                    .body("Please login first");
        }

        Farmer savedFarmer = service.save(farmer, userId);

        return ResponseEntity.ok(savedFarmer);
    }

    @PutMapping("/{id}")
    public Farmer update(
            @PathVariable Long id,
            @RequestBody Farmer farmer) {

        return service.update(id, farmer);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Record deleted successfully. ID: " + id;
    }
}