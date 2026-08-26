import { useEffect, useState } from "react";
import { getAllLoans } from "../services/LoanService";
import { getAllFarmers } from "../services/FarmerService";
import { Link } from "react-router-dom";
import {
    FaUsers,
    FaMoneyBillWave,
    FaClock,
    FaCheckCircle,
    FaTimesCircle
} from "react-icons/fa";

import "./Dashboard.css";

const Dashboard = () => {

    const [farmers, setFarmers] = useState([]);
    const [loans, setLoans] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {

        try {

            const farmerResponse = await getAllFarmers();
            const loanResponse = await getAllLoans();

            setFarmers(farmerResponse.data);
            setLoans(loanResponse.data);

        } catch (error) {

            console.error("Dashboard Error:", error);

        }
    };

    const pendingLoans = loans.filter(
        (loan) => loan.loanStatus === "PENDING"
    ).length;

    const approvedLoans = loans.filter(
        (loan) => loan.loanStatus === "APPROVED"
    ).length;

    const rejectedLoans = loans.filter(
        (loan) => loan.loanStatus === "REJECTED"
    ).length;

    return (

        <div className="dashboard-page">

            <div className="dashboard-container">

                {/* Header */}

                <div className="dashboard-header">

                    <div>
                        <span className="dashboard-label">
                            ADMIN PANEL
                        </span>

                        <h1>
                            AgroConnect Dashboard
                        </h1>

                        <p>
                            Manage farmers and monitor loan applications
                        </p>
                    </div>

                    <div className="dashboard-icon-large">
                        🌱
                    </div>

                </div>


                {/* Cards */}

                <div className="dashboard-grid">


                    {/* Farmers */}

                    <div className="dashboard-card farmers-card">

                        <div className="card-icon">
                            <FaUsers />
                        </div>

                        <div className="card-content">

                            <p>Total Farmers</p>

                            <h2>{farmers.length}</h2>

                        </div>

                        <Link
                            to="/farmers"
                            className="dashboard-btn"
                        >
                            View Farmers →
                        </Link>

                    </div>


                    {/* Loans */}

                    <div className="dashboard-card loans-card">

                        <div className="card-icon">
                            <FaMoneyBillWave />
                        </div>

                        <div className="card-content">

                            <p>Total Loans</p>

                            <h2>{loans.length}</h2>

                        </div>

                        <Link
                            to="/farmers/loan"
                            className="dashboard-btn"
                        >
                            View Loans →
                        </Link>

                    </div>


                    {/* Pending */}

                    <div className="dashboard-card pending-card">

                        <div className="card-icon">
                            <FaClock />
                        </div>

                        <div className="card-content">

                            <p>Pending Loans</p>

                            <h2>{pendingLoans}</h2>

                        </div>

                        <span className="status-text">
                            Waiting for approval
                        </span>

                    </div>


                    {/* Approved */}

                    <div className="dashboard-card approved-card">

                        <div className="card-icon">
                            <FaCheckCircle />
                        </div>

                        <div className="card-content">

                            <p>Approved Loans</p>

                            <h2>{approvedLoans}</h2>

                        </div>

                        <span className="status-text">
                            Successfully approved
                        </span>

                    </div>


                    {/* Rejected */}

                    <div className="dashboard-card rejected-card">

                        <div className="card-icon">
                            <FaTimesCircle />
                        </div>

                        <div className="card-content">

                            <p>Rejected Loans</p>

                            <h2>{rejectedLoans}</h2>

                        </div>

                        <span className="status-text">
                            Application rejected
                        </span>

                    </div>

                </div>


                {/* Loan Summary */}

                <div className="loan-summary">

                    <h3>
                        📊 Loan Summary
                    </h3>

                    <div className="summary-container">

                        <div className="summary-item">
                            <span>Pending</span>
                            <strong>{pendingLoans}</strong>
                        </div>

                        <div className="summary-item">
                            <span>Approved</span>
                            <strong>{approvedLoans}</strong>
                        </div>

                        <div className="summary-item">
                            <span>Rejected</span>
                            <strong>{rejectedLoans}</strong>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Dashboard;