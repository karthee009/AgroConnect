
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DRAFT_KEY = "agroconnect_loan_draft";

const initialForm = {
    loanAmount: "",
    loanDuration: "",
    intrestrate: ""
};

const AddLoan = () => {
    const [form, setForm] = useState(() => {
        try {
            const savedDraft = localStorage.getItem(DRAFT_KEY);

            return savedDraft
                ? { ...initialForm, ...JSON.parse(savedDraft) }
                : initialForm;
        } catch {
            return initialForm;
        }
    });

    const [step, setStep] = useState(1);
    const [errors, setErrors] = useState({});
    const [draftSaved, setDraftSaved] = useState(false);

    const amount = Number(form.loanAmount) || 0;
    const duration = Number(form.loanDuration) || 0;
    const annualRate = Number(form.intrestrate) || 0;

    // EMI calculation
    const monthlyRate = annualRate / 1200;

    const emi =
        amount <= 0 || duration <= 0
            ? 0
            : monthlyRate === 0
                ? amount / duration
                : (
                    amount *
                    monthlyRate *
                    Math.pow(1 + monthlyRate, duration)
                ) / (
                    Math.pow(1 + monthlyRate, duration) - 1
                );

    const totalRepayment = emi * duration;
    const totalInterest = totalRepayment - amount;

    // Automatically save draft in browser
    useEffect(() => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
            setDraftSaved(true);
        } catch {
            setDraftSaved(false);
        }
    }, [form]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: ""
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (
            form.loanAmount.trim() === "" ||
            !Number.isFinite(Number(form.loanAmount)) ||
            amount <= 0
        ) {
            newErrors.loanAmount =
                "Enter a loan amount greater than zero.";
        }

        if (
            form.loanDuration.trim() === "" ||
            !Number.isInteger(Number(form.loanDuration)) ||
            duration <= 0
        ) {
            newErrors.loanDuration =
                "Enter a valid duration in whole months.";
        }

        if (
            form.intrestrate.trim() === "" ||
            !Number.isFinite(Number(form.intrestrate)) ||
            annualRate < 0 ||
            annualRate > 100
        ) {
            newErrors.intrestrate =
                "Enter an interest rate between 0 and 100%.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleReview = (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        setStep(2);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleEdit = () => {
        setStep(1);
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleClearDraft = () => {
        const confirmed = window.confirm(
            "Clear all entered loan details?"
        );

        if (!confirmed) {
            return;
        }

        setForm({ ...initialForm });
        setErrors({});
        setStep(1);

        try {
            localStorage.removeItem(DRAFT_KEY);
            setDraftSaved(false);
        } catch {
            // Browser storage may be unavailable.
        }
    };

    const handleConfirm = () => {
        // Frontend-only preview. No backend request is made.
        const loanApplication = {
            loanAmount: amount,
            loanDuration: duration,
            intrestrate: annualRate,
            loanStatus: "PENDING"
        };

        console.log("Loan application preview:", loanApplication);

        alert(
            "Review completed! To submit this application to the database, connect your existing loan creation API."
        );
    };

    const formatCurrency = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(Number.isFinite(value) ? value : 0);

    return (
        <div className="container py-4 py-md-5">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">
                        Agricultural Loan
                    </h2>

                    <p className="text-muted mb-0">
                        Calculate, review and prepare your loan application.
                    </p>
                </div>

                <Link
                    to="/home"
                    className="btn btn-outline-secondary"
                >
                    Back To Home
                </Link>
            </div>

            {/* Progress indicator */}
            <div className="row g-3 mb-4">
                <div className="col-6">
                    <div
                        className={`card h-100 ${
                            step === 1
                                ? "border-success border-2"
                                : "border-success"
                        }`}
                    >
                        <div className="card-body d-flex align-items-center gap-3">
                            <span className="badge bg-success rounded-circle p-3">
                                1
                            </span>

                            <div>
                                <h6 className="mb-1">
                                    Loan Details
                                </h6>
                                <small className="text-muted">
                                    Enter your details
                                </small>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-6">
                    <div
                        className={`card h-100 ${
                            step === 2
                                ? "border-success border-2"
                                : ""
                        }`}
                    >
                        <div className="card-body d-flex align-items-center gap-3">
                            <span
                                className={`badge rounded-circle p-3 ${
                                    step === 2
                                        ? "bg-success"
                                        : "bg-secondary"
                                }`}
                            >
                                2
                            </span>

                            <div>
                                <h6 className="mb-1">
                                    Review
                                </h6>
                                <small className="text-muted">
                                    Check the summary
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Main form */}
                <div className="col-12 col-lg-7">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-header bg-success text-white p-4">
                            <h4 className="mb-1">
                                {step === 1
                                    ? "Enter Loan Details"
                                    : "Review Your Application"}
                            </h4>

                            <p className="mb-0">
                                {step === 1
                                    ? "Fill in the details below to calculate your estimated repayment."
                                    : "Verify all details before proceeding."}
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">
                            {step === 1 ? (
                                <form onSubmit={handleReview} noValidate>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="loanAmount"
                                            className="form-label fw-semibold"
                                        >
                                            Loan Amount (₹)
                                        </label>

                                        <input
                                            id="loanAmount"
                                            type="number"
                                            name="loanAmount"
                                            className={`form-control form-control-lg ${
                                                errors.loanAmount
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Example: 100000"
                                            min="0.01"
                                            step="0.01"
                                            value={form.loanAmount}
                                            onChange={handleChange}
                                            required
                                        />

                                        {errors.loanAmount && (
                                            <div className="invalid-feedback">
                                                {errors.loanAmount}
                                            </div>
                                        )}

                                        <small className="text-muted">
                                            Enter the amount you wish to borrow.
                                        </small>
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            htmlFor="loanDuration"
                                            className="form-label fw-semibold"
                                        >
                                            Loan Duration (Months)
                                        </label>

                                        <input
                                            id="loanDuration"
                                            type="number"
                                            name="loanDuration"
                                            className={`form-control form-control-lg ${
                                                errors.loanDuration
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Example: 12"
                                            min="1"
                                            step="1"
                                            value={form.loanDuration}
                                            onChange={handleChange}
                                            required
                                        />

                                        {errors.loanDuration && (
                                            <div className="invalid-feedback">
                                                {errors.loanDuration}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label
                                            htmlFor="intrestrate"
                                            className="form-label fw-semibold"
                                        >
                                            Annual Interest Rate (%)
                                        </label>

                                        <input
                                            id="intrestrate"
                                            type="number"
                                            name="intrestrate"
                                            className={`form-control form-control-lg ${
                                                errors.intrestrate
                                                    ? "is-invalid"
                                                    : ""
                                            }`}
                                            placeholder="Example: 12"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={form.intrestrate}
                                            onChange={handleChange}
                                            required
                                        />

                                        {errors.intrestrate && (
                                            <div className="invalid-feedback">
                                                {errors.intrestrate}
                                            </div>
                                        )}

                                        <small className="text-muted">
                                            Enter the annual rate offered by your lender.
                                        </small>
                                    </div>

                                    <div className="alert alert-info">
                                        <strong>Note:</strong> EMI is an estimate
                                        based on a fixed annual interest rate
                                        and monthly repayments.
                                    </div>

                                    <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-success btn-lg flex-grow-1"
                                        >
                                            Review Application
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-lg"
                                            onClick={handleClearDraft}
                                        >
                                            Clear Form
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div>
                                    <div className="alert alert-warning">
                                        <strong>Review only:</strong> This
                                        application has not been submitted
                                        to the backend.
                                    </div>

                                    <div className="table-responsive">
                                        <table className="table table-bordered align-middle">
                                            <tbody>
                                                <tr>
                                                    <th>Loan Amount</th>
                                                    <td>
                                                        {formatCurrency(amount)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Duration</th>
                                                    <td>
                                                        {duration} months
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Annual Interest</th>
                                                    <td>{annualRate}%</td>
                                                </tr>

                                                <tr>
                                                    <th>Estimated Monthly EMI</th>
                                                    <td className="fw-bold text-success">
                                                        {formatCurrency(emi)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Estimated Total Repayment</th>
                                                    <td>
                                                        {formatCurrency(totalRepayment)}
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <th>Loan Status</th>
                                                    <td>
                                                        <span className="badge bg-warning text-dark">
                                                            PENDING
                                                        </span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-outline-success btn-lg flex-grow-1"
                                            onClick={handleEdit}
                                        >
                                            Edit Details
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-success btn-lg flex-grow-1"
                                            onClick={handleConfirm}
                                        >
                                            Confirm Preview
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="text-muted small mt-4">
                                {draftSaved
                                    ? "Draft is saved in this browser."
                                    : "Draft could not be saved in this browser."}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live calculator */}
                <div className="col-12 col-lg-5">
                    <div className="card border-0 shadow-sm rounded-4 mb-4">
                        <div className="card-header bg-light p-4">
                            <h5 className="fw-bold mb-1">
                                EMI Calculator
                            </h5>

                            <p className="text-muted mb-0 small">
                                Updates automatically as you type.
                            </p>
                        </div>

                        <div className="card-body p-4">
                            <div className="bg-success text-white rounded-4 p-4 mb-3">
                                <div className="small">
                                    Estimated Monthly EMI
                                </div>

                                <h2 className="fw-bold my-2">
                                    {formatCurrency(emi)}
                                </h2>

                                <div className="small">
                                    {duration > 0
                                        ? `${duration} monthly payments`
                                        : "Enter a loan duration"}
                                </div>
                            </div>

                            <div className="d-flex justify-content-between gap-3 py-3 border-bottom">
                                <span className="text-muted">
                                    Principal Amount
                                </span>

                                <strong>
                                    {formatCurrency(amount)}
                                </strong>
                            </div>

                            <div className="d-flex justify-content-between gap-3 py-3 border-bottom">
                                <span className="text-muted">
                                    Total Interest
                                </span>

                                <strong>
                                    {formatCurrency(totalInterest)}
                                </strong>
                            </div>

                            <div className="d-flex justify-content-between gap-3 py-3">
                                <span className="text-muted">
                                    Total Repayment
                                </span>

                                <strong className="text-success">
                                    {formatCurrency(totalRepayment)}
                                </strong>
                            </div>

                            <div className="alert alert-light border small mb-0">
                                This is an estimate, not a loan offer.
                                Actual repayment may differ according to
                                lender terms, fees and repayment rules.
                            </div>
                        </div>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <h6 className="fw-bold mb-3">
                                Before You Continue
                            </h6>

                            <ul className="mb-0 ps-3">
                                <li className="mb-2">
                                    Check the loan amount carefully.
                                </li>

                                <li className="mb-2">
                                    Confirm the repayment duration.
                                </li>

                                <li className="mb-2">
                                    Use the interest rate provided by your lender.
                                </li>

                                <li>
                                    Review the calculated repayment before submitting.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLoan;
