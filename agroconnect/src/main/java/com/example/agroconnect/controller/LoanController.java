package com.example.agroconnect.controller;

import com.example.agroconnect.model.Loan;
import com.example.agroconnect.service.LoanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loan")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class LoanController {

    private final LoanService Lservice;

    public LoanController(LoanService Lservice){
        this.Lservice = Lservice;
    }

    @GetMapping
    public List<Loan> findAll(){
        return Lservice.findall();
    }
    @GetMapping("/farmer/{farmerid}")
    public List<Loan> getLoanByFarmersId(@PathVariable Long farmerid){
        return Lservice.findByfarmerId(farmerid);
    }
    @GetMapping("/loanbyid/{loanid}")
    public Loan findLoanById(@PathVariable Long loanid){
        return Lservice.findLoanById(loanid);
    }

    @GetMapping("/user/{userId}")
    public List<Loan> getLoansByUserId(@PathVariable Long userId) {
        return Lservice.findByUserId(userId);
    }



    @PostMapping("/farmer/{farmerId}")
    public Loan addLoan(
            @PathVariable Long farmerId,
            @RequestBody Loan loan) {

        return Lservice.addLoan(farmerId, loan);
    }

    @DeleteMapping("/{loanId}")
    public ResponseEntity<String> deleteLoan(
            @PathVariable Long loanId) {

        Lservice.deleteLoan(loanId);

        return ResponseEntity.ok("Loan deleted successfully");
    }
    @PutMapping("/updateloan/{loanid}")
    public Loan updateLoan(@PathVariable Long loanid,@RequestBody Loan loan){
        return Lservice.updateLoan(loanid , loan);
    }


    @PutMapping("/loanbyid/{loanid}/approve")
    public Loan approveLoan(@PathVariable Long loanid) {

        return Lservice.approveLoan(loanid);
    }


    @PutMapping("/loanbyid/{loanid}/reject")
    public Loan rejectLoan(@PathVariable Long loanid) {

        return Lservice.rejectLoan(loanid);
    }
}
