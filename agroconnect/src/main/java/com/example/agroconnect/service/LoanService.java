package com.example.agroconnect.service;

import com.example.agroconnect.model.Farmer;
import com.example.agroconnect.model.Loan;
import com.example.agroconnect.repository.FarmerRepository;
import com.example.agroconnect.repository.LoanRepository;
import com.example.agroconnect.model.LoanStatusHistory;
import com.example.agroconnect.repository.LoanStatusHistoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoanService {

    private final LoanRepository repo;
    private final FarmerRepository frepo;
    private final LoanStatusHistoryRepository historyRepository;
    public LoanService(LoanRepository repo, FarmerRepository frepo, LoanStatusHistoryRepository historyRepository){
        this.repo = repo; this.frepo = frepo; this.historyRepository = historyRepository;
    }
    private void recordStatus(Loan loan, String previous, String current, String note) {
        LoanStatusHistory h = new LoanStatusHistory(); h.setLoan(loan); h.setPreviousStatus(previous);
        h.setNewStatus(current); h.setChangedBy("SYSTEM/ADMIN"); h.setNote(note); historyRepository.save(h);
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
        if (loan.getLoanStatus() == null || loan.getLoanStatus().isBlank()) loan.setLoanStatus("PENDING");
        Loan saved = repo.save(loan);
        recordStatus(saved, null, saved.getLoanStatus(), "Loan application created");
        return saved;
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

        String previous = existing.getLoanStatus();
        existing.setLoanStatus("APPROVED");
        Loan saved = repo.save(existing); recordStatus(saved, previous, "APPROVED", "Loan approved by admin");
        return saved;
    }


    public Loan rejectLoan(Long loanid) {

        Loan existing = repo.findById(loanid)
                .orElseThrow(() ->
                        new RuntimeException("Loan not found"));

        String previous = existing.getLoanStatus();
        existing.setLoanStatus("REJECTED");
        Loan saved = repo.save(existing); recordStatus(saved, previous, "REJECTED", "Loan rejected by admin");
        return saved;
    }
}
