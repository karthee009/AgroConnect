package com.example.agroconnect.service;

import com.example.agroconnect.model.Farmer;
import com.example.agroconnect.model.Loan;
import com.example.agroconnect.repository.FarmerRepository;
import com.example.agroconnect.repository.LoanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanService {

    private final LoanRepository repo;
    private final FarmerRepository frepo;
    public LoanService(LoanRepository repo, FarmerRepository frepo){
        this.repo = repo;
        this.frepo = frepo;
    }

    public List<Loan> findall(){
        return repo.findAll();
    }

    public List<Loan> findByfarmerId(Long farmerid){
        return repo.findByFarmerId(farmerid);
    }

    public List<Loan> findByUserId(Long userId) {
        return repo.findByFarmerUserId(userId);
    }


    public Loan findLoanById(Long loanid) {

        return repo.findById(loanid)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));
    }


    public Loan addLoan(Long farmerId, Loan loan) {

        Farmer farmer = frepo.findById(farmerId)
                .orElseThrow(() ->
                        new RuntimeException("Farmer not found"));

        loan.setFarmer(farmer);

        return repo.save(loan);
    }

    public Loan updateLoan(Long loanid, Loan loan) {

        Loan existing = repo.findById(loanid)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));

        existing.setLoanAmount(loan.getLoanAmount());
        existing.setIntrestrate(loan.getIntrestrate());
        existing.setLoanDuration(loan.getLoanDuration());
        existing.setLoanStatus(loan.getLoanStatus());

        return repo.save(existing);
    }
    public void deleteLoan(Long loanid) {

        if (!repo.existsById(loanid)) {
            throw new RuntimeException("Loan not found");
        }

        repo.deleteById(loanid);
    }
    public Loan approveLoan(Long loanid) {

        Loan existing = repo.findById(loanid)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));

        existing.setLoanStatus("APPROVED");

        return repo.save(existing);
    }


    public Loan rejectLoan(Long loanid) {

        Loan existing = repo.findById(loanid)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));

        existing.setLoanStatus("REJECTED");

        return repo.save(existing);
    }
}
