package com.example.agroconnect.controller;

import com.example.agroconnect.model.Farmer;
import com.example.agroconnect.service.FarmerService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/farmer")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FarmerController {
    private final FarmerService service;
    public FarmerController(FarmerService service) { this.service = service; }

    private boolean allowed(Farmer farmer, HttpSession session) {
        Object uid = session.getAttribute("userId");
        return uid != null && ("ADMIN".equals(session.getAttribute("role")) ||
                (farmer.getUser() != null && farmer.getUser().getId().toString().equals(uid.toString())));
    }

    @GetMapping public ResponseEntity<?> findAll(HttpSession session) {
        Object userId = session.getAttribute("userId"); String role = (String) session.getAttribute("role");
        if (userId == null || role == null) return ResponseEntity.status(401).body("Please login first");
        if ("ADMIN".equals(role)) return ResponseEntity.ok(service.findAll());
        return ResponseEntity.ok(service.findByUserId(Long.valueOf(userId.toString())));
    }

    @GetMapping("/{id}") public ResponseEntity<?> findById(@PathVariable Long id, HttpSession session) {
        try { Farmer farmer = service.findById(id); if (!allowed(farmer, session)) return ResponseEntity.status(session.getAttribute("userId") == null ? 401 : 403).body("Not allowed"); return ResponseEntity.ok(farmer); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @PostMapping public ResponseEntity<?> save(@RequestBody Farmer farmer, HttpSession session) {
        Object userId = session.getAttribute("userId"); if (userId == null) return ResponseEntity.status(401).body("Please login first");
        return ResponseEntity.ok(service.save(farmer, Long.valueOf(userId.toString())));
    }

    @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Farmer farmer, HttpSession session) {
        try { Farmer existing = service.findById(id); if (!allowed(existing, session)) return ResponseEntity.status(session.getAttribute("userId") == null ? 401 : 403).body("Not allowed"); return ResponseEntity.ok(service.update(id, farmer)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id, HttpSession session) {
        try { Farmer farmer = service.findById(id); if (!allowed(farmer, session)) return ResponseEntity.status(session.getAttribute("userId") == null ? 401 : 403).body("Not allowed"); service.delete(id); return ResponseEntity.ok("Record deleted successfully. ID: " + id); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }
}
