package com.example.agroconnect.model;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;


import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;


@JsonPropertyOrder({
        "id",
        "fullName",
        "email",
        "phone",
        "village",
        "district",
        "state",
        "landArea",
        "cropType"
})

@Entity
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;




    private String fullName;
    private String email;
    private String phone;
    private String village;
    private String district;
    private String state;
    private Double landArea;
    private String cropType;

    public Farmer(){}

    public void setId(Long id){
        this.id = id;
    }
    public Long getId(){
        return this.id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }




    public void setFullName(String fullName){
        this.fullName = fullName;
    }
    public String getFullName(){
        return this.fullName;
    }

    public void setEmail(String email){
        this.email= email;
    }
    public String getEmail(){
        return this.email;
    }
    public void setPhone(String phone){
        this.phone = phone;
    }
    public String getPhone(){
        return this.phone;
    }
    public void setVillage(String village){
        this.village = village;
    }
    public String getVillage(){
        return this.village;
    }
    public void setDistrict(String district){
        this.district = district;
    }
    public String getDistrict(){
        return this.district;
    }
    public void setState(String state){
        this.state = state;
    }
    public String getState(){
        return this.state;
    }
    public void setLandArea(Double landArea){
        this.landArea = landArea;
    }
    public Double getLandArea(){
        return this.landArea;
    }
    public void setCropType(String cropType){
        this.cropType = cropType;
    }
    public String getCropType(){
        return this.cropType;
    }
}
