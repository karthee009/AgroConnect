import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddFarmer.css";

import { addFarmer } from "../services/FarmerService";
import { addLoan } from "../services/LoanService";

const AddFarmer = () => {

    const navigate = useNavigate();

    const [form, setForm] = useState({

        // Farmer details
        fullName: "",
        email: "",
        phone: "",
        village: "",
        district: "",
        state: "",
        landArea: "",
        cropType: "",

        // Loan details
        loanAmount: "",
        loanDuration: "",
        intrestrate: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {

        // STEP 1: Add Farmer
        const farmerResponse = await addFarmer({
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
            village: form.village,
            district: form.district,
            state: form.state,
            landArea: Number(form.landArea),
            cropType: form.cropType
        });

        console.log("Farmer Response:", farmerResponse.data);

        const farmerId = farmerResponse.data.id;

        console.log("Created Farmer ID:", farmerId);


        // STEP 2: Add Loan
        const loanData = {
            loanAmount: Number(form.loanAmount),
            loanDuration: Number(form.loanDuration),
            intrestrate: Number(form.intrestrate),
            loanStatus: "PENDING"
        };

        console.log("Loan Data:", loanData);

        const loanResponse = await addLoan(
            farmerId,
            loanData
        );

        console.log("Loan Response:", loanResponse.data);

        alert("Farmer and Loan added successfully!");

        navigate("/farmers");

    } catch (error) {

        console.error("FULL ERROR:", error);

        console.error(
            "STATUS:",
            error.response?.status
        );

        console.error(
            "BACKEND ERROR:",
            error.response?.data
        );

        alert(
            error.response?.data ||
            "Loan creation failed"
        );
    }
};

    return (

        <div className="add-farmer">

            <div className="form-overlay"></div>

            <div className="farmer-wrapper">

                <form
                    className="adding-form"
                    onSubmit={handleSubmit}
                >

                    <h1>🌾 Farmer & Loan Application</h1>

                    <p className="form-subtitle">
                        Enter farmer and loan details
                    </p>


                    {/* FARMER DETAILS */}

                    <h2>Farmer Details</h2>

                    <div className="form-grid">

                        <input
                            type="text"
                            placeholder="Enter full name"
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Enter email address"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Enter phone number"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Enter village"
                            name="village"
                            value={form.village}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Enter district"
                            name="district"
                            value={form.district}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Enter state"
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Enter crop type"
                            name="cropType"
                            value={form.cropType}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            placeholder="Land area in acres"
                            name="landArea"
                            value={form.landArea}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* LOAN DETAILS */}

                    <h2>Loan Details</h2>

                    <div className="form-grid">

                        <input
                            type="number"
                            placeholder="Loan Amount"
                            name="loanAmount"
                            value={form.loanAmount}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            placeholder="Loan Duration (months)"
                            name="loanDuration"
                            value={form.loanDuration}
                            onChange={handleChange}
                            required
                        />

                        <input
                            type="number"
                            step="0.01"
                            placeholder="Interest Rate (%)"
                            name="intrestrate"
                            value={form.intrestrate}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Submit Farmer & Loan
                    </button>

                </form>

            </div>

        </div>
    );
};

export default AddFarmer;