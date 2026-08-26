import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getLoanById, updateLoan } from "../services/LoanService";

const EditLoan = () => {

    const { loanId } = useParams();
    const navigate = useNavigate();

    const [loan, setLoan] = useState({
        loanAmount: "",
        intrestrate: "",
        loanDuration: "",
        loanStatus: ""
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLoan();
    }, [loanId]);

    const loadLoan = async () => {

        try {

            const response = await getLoanById(loanId);

            console.log("Loan Details:", response.data);

            setLoan({
                loanAmount: response.data.loanAmount,
                intrestrate: response.data.intrestrate,
                loanDuration: response.data.loanDuration,
                loanStatus: response.data.loanStatus
            });

            setLoading(false);

        } catch (error) {

            console.error("Error loading loan:", error);
            alert("Failed to load loan");

            setLoading(false);
        }
    };

    const handleChange = (e) => {

        setLoan({
            ...loan,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateLoan(loanId, {
                loanAmount: loan.loanAmount,
                intrestrate: loan.intrestrate,
                loanDuration: loan.loanDuration,
                loanStatus: loan.loanStatus
            });

            alert("Loan Updated Successfully!");

            navigate("/farmers/loan");

        } catch (error) {

            console.error("Update Loan Error:", error);

            alert("Failed to update loan");
        }
    };

    if (loading) {
        return <h3 className="text-center mt-5">Loading...</h3>;
    }

    return (

        <div className="container mt-5">

            <div className="card shadow p-4">

                <h2 className="mb-4">Edit Loan</h2>

                <form onSubmit={handleSubmit}>

                    {/* Loan Amount */}
                    <div className="mb-3">

                        <label className="form-label">
                            Loan Amount
                        </label>

                        <input
                            type="number"
                            name="loanAmount"
                            className="form-control"
                            value={loan.loanAmount}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Interest Rate */}
                    <div className="mb-3">

                        <label className="form-label">
                            Interest Rate
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            name="intrestrate"
                            className="form-control"
                            value={loan.intrestrate}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Duration */}
                    <div className="mb-3">

                        <label className="form-label">
                            Loan Duration
                        </label>

                        <input
                            type="number"
                            name="loanDuration"
                            className="form-control"
                            value={loan.loanDuration}
                            onChange={handleChange}
                            required
                        />

                    </div>


                    {/* Status */}
                    <div className="mb-3">

                        <label className="form-label">
                            Loan Status
                        </label>

                        <select
                            name="loanStatus"
                            className="form-select"
                            value={loan.loanStatus}
                            onChange={handleChange}
                            required
                        >

                            <option value="">
                                Select Status
                            </option>

                            <option value="PENDING">
                                PENDING
                            </option>

                            <option value="APPROVED">
                                APPROVED
                            </option>

                            <option value="REJECTED">
                                REJECTED
                            </option>

                        </select>

                    </div>


                    <button
                        type="submit"
                        className="btn btn-success me-2"
                    >
                        Update Loan
                    </button>


                    <Link
                        to="/farmers/loan"
                        className="btn btn-secondary"
                    >
                        Cancel
                    </Link>

                </form>

            </div>

        </div>
    );
};

export default EditLoan;