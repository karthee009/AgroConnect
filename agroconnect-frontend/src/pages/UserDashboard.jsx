import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLoansByUserId } from "../services/LoanService";

const UserDashboard = () => {

    const [user, setUser] = useState(null);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const loggedUser = JSON.parse(
                    localStorage.getItem("user")
                );

                if (!loggedUser) {
                    console.log("User not found");
                    return;
                }

                setUser(loggedUser);

                const response = await getLoansByUserId(
                    loggedUser.id
                );

                setLoans(response.data);

            } catch (error) {

                console.error("User Dashboard Error:", error);

            } finally {

                setLoading(false);

            }
        };

        loadDashboard();

    }, []);

    const pendingLoans = loans.filter(
        (loan) => loan.loanStatus === "PENDING"
    ).length;

    const approvedLoans = loans.filter(
        (loan) => loan.loanStatus === "APPROVED"
    ).length;

    const rejectedLoans = loans.filter(
        (loan) => loan.loanStatus === "REJECTED"
    ).length;

    if (loading) {
        return (
            <div className="container mt-5">
                <h4>Loading Dashboard...</h4>
            </div>
        );
    }

    return (
        <div className="container mt-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2>User Dashboard</h2>
                    <p className="text-muted mb-0">
                        Welcome, {user?.name || user?.username || "User"}
                    </p>
                </div>

                <Link
                    to="/home"
                    className="btn btn-outline-danger"
                >
                    Back To Home
                </Link>

            </div>


            <div className="row g-4">

                <div className="col-md-3">

                    <div className="card shadow-sm text-center">

                        <div className="card-body">

                            <h6>Total Loans</h6>

                            <h2>{loans.length}</h2>

                        </div>

                    </div>

                </div>


                <div className="col-md-3">

                    <div className="card shadow-sm text-center">

                        <div className="card-body">

                            <h6>Pending</h6>

                            <h2>{pendingLoans}</h2>

                        </div>

                    </div>

                </div>


                <div className="col-md-3">

                    <div className="card shadow-sm text-center">

                        <div className="card-body">

                            <h6>Approved</h6>

                            <h2>{approvedLoans}</h2>

                        </div>

                    </div>

                </div>


                <div className="col-md-3">

                    <div className="card shadow-sm text-center">

                        <div className="card-body">

                            <h6>Rejected</h6>

                            <h2>{rejectedLoans}</h2>

                        </div>

                    </div>

                </div>

            </div>


            <div className="card shadow-sm mt-5">

                <div className="card-header">
                    <h4 className="mb-0">My Loans</h4>
                </div>

                <div className="card-body">

                    {loans.length === 0 ? (

                        <p className="text-center">
                            No loans found.
                        </p>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-bordered">

                                <thead>

                                    <tr>

                                        <th>Loan ID</th>
                                        <th>Loan Amount</th>
                                        <th>Interest Rate</th>
                                        <th>Duration</th>
                                        <th>Status</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {loans.map((loan) => (

                                        <tr key={loan.loanId}>

                                            <td>{loan.loanId}</td>
                                            <td>{loan.loanAmount}</td>
                                            <td>{loan.intrestrate}</td>
                                            <td>{loan.loanDuration}</td>

                                            <td>

                                                <span
                                                    className={
                                                        loan.loanStatus === "APPROVED"
                                                            ? "badge bg-success"
                                                            : loan.loanStatus === "REJECTED"
                                                            ? "badge bg-danger"
                                                            : "badge bg-warning text-dark"
                                                    }
                                                >
                                                    {loan.loanStatus}
                                                </span>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            <div className="mt-4">

                <Link
                    to="/add-loan"
                    className="btn btn-success me-3"
                >
                    Apply New Loan
                </Link>

                <Link
                    to="/farmers/loan"
                    className="btn btn-primary"
                >
                    View All My Loans
                </Link>

            </div>

        </div>
    );
};

export default UserDashboard;