package com.example.agroconnect.repository;

import com.example.agroconnect.model.Loan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan>findByFarmerId(Long farmerid);
    List<Loan> findByFarmerUserId(Long userId);

}
