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

    useEffect(() => {

        const loggedUser = JSON.parse(localStorage.getItem("user"));

        setUser(loggedUser);

        loadLoans();

    }, []);

    const loadLoans = async () => {

        try {

            const loggedUser =
                JSON.parse(localStorage.getItem("user"));

            console.log("Logged In User:", loggedUser);

            if (!loggedUser) {
                console.log("User not found");
                return;
            }

            let response;

            // ADMIN → அனைத்து loans
            if (loggedUser.role === "ADMIN") {

                console.log("ADMIN: Getting all loans");

                response = await getAllLoans();

            } else {

                // USER → அவருடைய loans மட்டும்
                console.log("USER: Getting user loans");

                if (!loggedUser.id) {
                    console.log("User ID not found");
                    return;
                }

                response = await getLoansByUserId(
                    loggedUser.id
                );
            }

            console.log("Loan Response:", response.data);

            setLoans(response.data);

        } catch (error) {

            console.error("Loan Error:", error);

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

        alert("Loan Approved Successfully!");

        loadLoans();

    } catch (error) {

        console.error("Approve Error:", error);

        alert("Failed to approve loan");

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

        alert("Loan Rejected!");

        loadLoans();

    } catch (error) {

        console.error("Reject Error:", error);

        alert("Failed to reject loan");

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

        console.log("Deleting Loan ID:", loanId);

        await deleteLoan(loanId);

        alert("Loan Deleted Successfully!");

        loadLoans();

    } catch (error) {

        console.error("Delete Error:", error);
        alert("Failed to delete loan");

    }
};
    return (
        <div className="container mt-4">

            <div className="container mt-4">

                <Link
                    to="/home"
                    className="btn btn-outline-danger"
                >
                    Back To Home
                </Link>

            </div>

            <h2 className="mb-4">Loan List</h2>

            <table className="table table-bordered table-striped">

                <thead>

                    <tr>

                        <th>Full Name</th>
                        <th>Loan ID</th>
                        <th>Loan Amount</th>
                        <th>Interest Rate</th>
                        <th>Duration</th>
                        <th>Status</th>

                        {/* ADMIN மட்டும் */}
                        {user?.role === "ADMIN" && (
                            <th>Actions</th>
                        )}

                    </tr>

                </thead>

                <tbody>

                    {loans.map((loan) => (

                        <tr key={loan.loanId}>

                            <td>{loan.farmer?.fullName}</td>
                            <td>{loan.loanId}</td>
                            <td>{loan.loanAmount}</td>
                            <td>{loan.intrestrate}</td>
                            <td>{loan.loanDuration}</td>
                            <td>{loan.loanStatus}</td>

                            {/* ADMIN மட்டும் */}
                            {user?.role === "ADMIN" && (

                                <td>

    <Link
        to={`/edit-loan/${loan.loanId}`}
        className="btn btn-warning btn-sm me-2"
    >
        Edit
    </Link>

    {/* PENDING status இருந்தால் மட்டும் Approve + Reject */}
    {loan.loanStatus === "PENDING" && (
        <>
            <button
                className="btn btn-success btn-sm me-2"
                onClick={() => handleApprove(loan)}
            >
                Approve
            </button>

            <button
                className="btn btn-secondary btn-sm me-2"
                onClick={() => handleReject(loan)}
            >
                Reject
            </button>
        </>
    )}

    <button
        className="btn btn-danger btn-sm"
        onClick={() => handleDelete(loan.loanId)}
    >
        Delete
    </button>

</td>
                            )}

                        </tr>

                    ))}

                </tbody>

            </table>

            <Link
                to="/farmers"
                className="btn btn-outline-success"
            >
                View Farmers
            </Link>


                    <Link to="/add-farmers" className="btn btn-outline-success ms-4">Add-Loan</Link>


        </div>
    );
};

export default LoanList;