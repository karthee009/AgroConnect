package com.example.agroconnect.controller;

import com.example.agroconnect.model.Farmer;
import com.example.agroconnect.model.Loan;
import com.example.agroconnect.repository.FarmerRepository;
import com.example.agroconnect.service.LoanService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/loan")
@CrossOrigin(origins="http://localhost:5173", allowCredentials="true")
public class LoanController {
    private final LoanService service; private final FarmerRepository farmers;
    public LoanController(LoanService service, FarmerRepository farmers) { this.service=service; this.farmers=farmers; }
    private boolean admin(HttpSession s){return "ADMIN".equals(s.getAttribute("role")) && s.getAttribute("userId")!=null;}
    private boolean allowed(Loan l,HttpSession s){Object uid=s.getAttribute("userId");return uid!=null&&(admin(s)||(l.getFarmer()!=null&&l.getFarmer().getUser()!=null&&l.getFarmer().getUser().getId().toString().equals(uid.toString())));}
    @GetMapping public ResponseEntity<?> findAll(HttpSession s){if(s.getAttribute("userId")==null)return ResponseEntity.status(401).body("Please login first");if(admin(s))return ResponseEntity.ok(service.findall());return ResponseEntity.ok(service.findByUserId(Long.valueOf(s.getAttribute("userId").toString())));}
    @GetMapping("/farmer/{farmerId}") public ResponseEntity<?> byFarmer(@PathVariable Long farmerId,HttpSession s){Farmer f=farmers.findById(farmerId).orElse(null);if(f==null)return ResponseEntity.notFound().build();if(s.getAttribute("userId")==null)return ResponseEntity.status(401).body("Please login first");if(!admin(s)&&(f.getUser()==null||!f.getUser().getId().toString().equals(s.getAttribute("userId").toString())))return ResponseEntity.status(403).body("Not allowed");return ResponseEntity.ok(service.findByfarmerId(farmerId));}
    @GetMapping("/loanbyid/{loanId}") public ResponseEntity<?> byId(@PathVariable Long loanId,HttpSession s){try{Loan l=service.findLoanById(loanId);if(!allowed(l,s))return ResponseEntity.status(s.getAttribute("userId")==null?401:403).body("Not allowed");return ResponseEntity.ok(l);}catch(RuntimeException e){return ResponseEntity.notFound().build();}}
    @GetMapping("/user/{userId}") public ResponseEntity<?> byUser(@PathVariable Long userId,HttpSession s){if(s.getAttribute("userId")==null)return ResponseEntity.status(401).body("Please login first");if(!admin(s)&&!s.getAttribute("userId").toString().equals(userId.toString()))return ResponseEntity.status(403).body("Not allowed");return ResponseEntity.ok(service.findByUserId(userId));}
    @PostMapping("/farmer/{farmerId}") public ResponseEntity<?> add(@PathVariable Long farmerId,@RequestBody Loan loan,HttpSession s){Farmer f=farmers.findById(farmerId).orElse(null);if(f==null)return ResponseEntity.notFound().build();if(s.getAttribute("userId")==null)return ResponseEntity.status(401).body("Please login first");if(!admin(s)&&(f.getUser()==null||!f.getUser().getId().toString().equals(s.getAttribute("userId").toString())))return ResponseEntity.status(403).body("Not allowed");if(loan.getLoanAmount()<=0||loan.getLoanDuration()<=0)return ResponseEntity.badRequest().body("Loan amount and duration must be positive");loan.setLoanStatus("PENDING");return ResponseEntity.ok(service.addLoan(farmerId,loan));}
    @DeleteMapping("/{loanId}") public ResponseEntity<?> delete(@PathVariable Long loanId,HttpSession s){try{Loan l=service.findLoanById(loanId);if(!admin(s))return ResponseEntity.status(s.getAttribute("userId")==null?401:403).body("Only admin can delete loans");service.deleteLoan(loanId);return ResponseEntity.ok("Loan deleted successfully");}catch(RuntimeException e){return ResponseEntity.notFound().build();}}
    @PutMapping("/updateloan/{loanId}") public ResponseEntity<?> update(@PathVariable Long loanId,@RequestBody Loan loan,HttpSession s){if(!admin(s))return ResponseEntity.status(s.getAttribute("userId")==null?401:403).body("Only admin can update loan records");try{return ResponseEntity.ok(service.updateLoan(loanId,loan));}catch(RuntimeException e){return ResponseEntity.notFound().build();}}
    @PutMapping("/loanbyid/{loanId}/approve") public ResponseEntity<?> approve(@PathVariable Long loanId,HttpSession s){if(!admin(s))return ResponseEntity.status(s.getAttribute("userId")==null?401:403).body("Only admin can approve loans");try{return ResponseEntity.ok(service.approveLoan(loanId));}catch(RuntimeException e){return ResponseEntity.notFound().build();}}
    @PutMapping("/loanbyid/{loanId}/reject") public ResponseEntity<?> reject(@PathVariable Long loanId,HttpSession s){if(!admin(s))return ResponseEntity.status(s.getAttribute("userId")==null?401:403).body("Only admin can reject loans");try{return ResponseEntity.ok(service.rejectLoan(loanId));}catch(RuntimeException e){return ResponseEntity.notFound().build();}}
}
