package com.example.agroconnect.model;
import jakarta.persistence.*; import java.time.LocalDate;
@Entity @Table(name="farm_transactions") public class FarmTransaction {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(optional=false) @JoinColumn(name="farmer_id") private Farmer farmer;
 @Column(nullable=false) private String type; private String category; private String cropType;
 @Column(nullable=false) private double amount; private LocalDate transactionDate; @Column(length=1000) private String notes;
 public Long getId(){return id;} public void setId(Long v){id=v;} public Farmer getFarmer(){return farmer;} public void setFarmer(Farmer v){farmer=v;} public String getType(){return type;} public void setType(String v){type=v;} public String getCategory(){return category;} public void setCategory(String v){category=v;} public String getCropType(){return cropType;} public void setCropType(String v){cropType=v;} public double getAmount(){return amount;} public void setAmount(double v){amount=v;} public LocalDate getTransactionDate(){return transactionDate;} public void setTransactionDate(LocalDate v){transactionDate=v;} public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
}
