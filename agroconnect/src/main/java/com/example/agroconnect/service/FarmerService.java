package com.example.agroconnect.service;

import com.example.agroconnect.model.Farmer;
import com.example.agroconnect.model.User;
import com.example.agroconnect.repository.FarmerRepository;
import com.example.agroconnect.repository.UserRepository;
import com.example.agroconnect.repository.LoanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FarmerService {

    private final FarmerRepository repo;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;

    public FarmerService(
            FarmerRepository repo,
            UserRepository userRepository,
            LoanRepository loanRepository) {

        this.repo = repo;
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
    }

    public List<Farmer> findAll() {
        return repo.findAll();
    }

    public Farmer findById(Long id) {

        return repo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Farmer not found")
                );
    }

    // User ID vachu farmer list
    public List<Farmer> findByUserId(Long userId) {

        return repo.findByUserId(userId);
    }

    // Logged-in user-oda farmer save
    public Farmer save(Farmer farmer, Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(
                        () -> new RuntimeException("User not found")
                );

        farmer.setUser(user);

        return repo.save(farmer);
    }

    public Farmer update(Long id, Farmer farmer) {

        Farmer existing = repo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("ID not found")
                );

        existing.setFullName(farmer.getFullName());
        existing.setEmail(farmer.getEmail());
        existing.setPhone(farmer.getPhone());
        existing.setLandArea(farmer.getLandArea());
        existing.setDistrict(farmer.getDistrict());
        existing.setVillage(farmer.getVillage());
        existing.setState(farmer.getState());
        existing.setCropType(farmer.getCropType());

        return repo.save(existing);
    }

    // DELETE FARMER
    public void delete(Long id) {

        // First check farmer exists
        Farmer farmer = repo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Farmer not found")
                );

        // Delete loans associated with this farmer
        List<com.example.agroconnect.model.Loan> loans =
                loanRepository.findByFarmerId(id);

        loanRepository.deleteAll(loans);

        // Finally delete farmer
        repo.delete(farmer);
    }
}