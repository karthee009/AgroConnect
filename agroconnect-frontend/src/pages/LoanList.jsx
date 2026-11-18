
import { useEffect, useState } from "react";
import {
    getLoansByUserId,
    getAllLoans,
    updateLoan,
    deleteLoan
} from "../services/LoanService";
import { Link } from "react-router-dom";

const LoanList = () => {
    const [loans, setLoans] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const loggedUser = JSON.parse(
            localStorage.getItem("user")
        );

        setUser(loggedUser);
        loadLoans(loggedUser);
    }, []);

    const loadLoans = async (loggedUser = user) => {
        try {
            setLoading(true);
            setErrorMessage("");

            if (!loggedUser) {
                setErrorMessage("Please login to view loans.");
                return;
            }

            let response;

            if (loggedUser.role === "ADMIN") {
                response = await getAllLoans();
            } else {
                if (!loggedUser.id) {
                    setErrorMessage("User ID not found. Please login again.");
                    return;
                }

                response = await getLoansByUserId(loggedUser.id);
            }

            setLoans(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (error) {
            console.error("Loan Error:", error);

            setErrorMessage(
                error.response?.status === 401
                    ? "Session expired. Please login again."
                    : "Unable to load loans. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (loan) => {
        try {
            await updateLoan(loan.loanId, {
                loanAmount: loan.loanAmount,
                intrestrate: loan.intrestrate,
                loanDuration: loan.loanDuration,
                loanStatus: "APPROVED"
            });

            alert("Loan approved successfully!");
            await loadLoans();
        } catch (error) {
            console.error("Approve Error:", error);
            alert("Failed to approve loan.");
        }
    };

    const handleReject = async (loan) => {
        try {
            await updateLoan(loan.loanId, {
                loanAmount: loan.loanAmount,
                intrestrate: loan.intrestrate,
                loanDuration: loan.loanDuration,
                loanStatus: "REJECTED"
            });

            alert("Loan rejected successfully!");
            await loadLoans();
        } catch (error) {
            console.error("Reject Error:", error);
            alert("Failed to reject loan.");
        }
    };

    const handleDelete = async (loanId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this loan?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteLoan(loanId);

            alert("Loan deleted successfully!");
            await loadLoans();
        } catch (error) {
            console.error("Delete Error:", error);
            alert("Failed to delete loan.");
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "APPROVED":
                return "bg-success";
            case "REJECTED":
                return "bg-danger";
            case "PENDING":
                return "bg-warning text-dark";
            default:
                return "bg-secondary";
        }
    };

    return (
        <div className="container-fluid px-3 px-md-4 py-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Loan Management</h2>
                    <p className="text-muted mb-0">
                        View and manage agricultural loan applications.
                    </p>
                </div>

                <Link
                    to="/home"
                    className="btn btn-outline-danger"
                >
                    Back To Home
                </Link>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-3 p-md-4">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <h5 className="fw-semibold mb-0">
                            Loan Applications
                        </h5>

                        {!loading && (
                            <span className="badge bg-primary">
                                Total: {loans.length}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <div
                                className="spinner-border text-success"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                            <p className="mt-2 mb-0">
                                Loading loans...
                            </p>
                        </div>
                    ) : errorMessage ? (
                        <div className="alert alert-warning" role="alert">
                            {errorMessage}

                            <button
                                className="btn btn-sm btn-outline-dark ms-2"
                                onClick={() => loadLoans()}
                            >
                                Retry
                            </button>
                        </div>
                    ) : loans.length === 0 ? (
                        <div className="text-center py-5">
                            <h5>No loans found</h5>
                            <p className="text-muted mb-0">
                                Loan applications will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-bordered table-hover align-middle mb-0">
                                <thead className="table-success">
                                    <tr>
                                        <th>Full Name</th>
                                        <th>Loan ID</th>
                                        <th>Loan Amount</th>
                                        <th>Interest Rate</th>
                                        <th>Duration</th>
                                        <th>Status</th>

                                        {user?.role === "ADMIN" && (
                                            <th>Actions</th>
                                        )}
                                    </tr>
                                </thead>

                                <tbody>
                                    {loans.map((loan) => (
                                        <tr key={loan.loanId}>
                                            <td>
                                                {loan.farmer?.fullName || "-"}
                                            </td>

                                            <td>{loan.loanId}</td>

                                            <td>
                                                ₹{loan.loanAmount}
                                            </td>

                                            <td>
                                                {loan.intrestrate}%
                                            </td>

                                            <td>
                                                {loan.loanDuration}
                                            </td>

                                            <td>
                                                <span
                                                    className={`badge ${getStatusClass(
                                                        loan.loanStatus
                                                    )}`}
                                                >
                                                    {loan.loanStatus}
                                                </span>
                                            </td>

                                            {user?.role === "ADMIN" && (
                                                <td>
                                                    <div className="d-flex flex-wrap gap-2">
                                                        <Link
                                                            to={`/edit-loan/${loan.loanId}`}
                                                            className="btn btn-warning btn-sm"
                                                        >
                                                            Edit
                                                        </Link>

                                                        {loan.loanStatus === "PENDING" && (
                                                            <>
                                                                <button
                                                                    className="btn btn-success btn-sm"
                                                                    onClick={() =>
                                                                        handleApprove(loan)
                                                                    }
                                                                >
                                                                    Approve
                                                                </button>

                                                                <button
                                                                    className="btn btn-secondary btn-sm"
                                                                    onClick={() =>
                                                                        handleReject(loan)
                                                                    }
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}

                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    loan.loanId
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="d-flex flex-wrap gap-2 mt-4">
                        <Link
                            to="/farmers"
                            className="btn btn-outline-success"
                        >
                            View Farmers
                        </Link>

                        <Link
                            to="/add-farmers"
                            className="btn btn-success"
                        >
                            Add Loan
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanList;
