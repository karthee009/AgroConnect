import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddFarmer.css";

import { addFarmer } from "../services/FarmerService";
import { addLoan } from "../services/LoanService";

/* =====================================================
   CONSTANTS
   (Backend payloads are unchanged. Everything added below
   is frontend-only helper information.)
===================================================== */

const DRAFT_KEY = "agroconnect_farmer_loan_draft";

// Default loan terms
const DEFAULT_LOAN_DURATION = 12;
const DEFAULT_INTEREST_RATE = 7.5;

const OTHER_CROP = "Other";

// Land unit conversions
const ACRE_TO_HECTARE = 0.404686;
const ACRE_TO_CENTS = 100; // 1 acre = 100 cents (used in Tamil Nadu)

const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
];

// Indicative crop information. Cost per acre is only a rough guide
// and varies by district, season and the lender's scale of finance.
const CROPS = [
    {
        name: "Paddy (Rice)",
        seasons: ["Kharif", "Rabi"],
        duration: "110 - 150 days",
        water: "High",
        costPerAcre: 40000
    },
    {
        name: "Wheat",
        seasons: ["Rabi"],
        duration: "110 - 140 days",
        water: "Medium",
        costPerAcre: 28000
    },
    {
        name: "Sugarcane",
        seasons: ["Annual"],
        duration: "10 - 14 months",
        water: "High",
        costPerAcre: 75000
    },
    {
        name: "Cotton",
        seasons: ["Kharif"],
        duration: "150 - 180 days",
        water: "Medium",
        costPerAcre: 45000
    },
    {
        name: "Maize",
        seasons: ["Kharif", "Rabi"],
        duration: "90 - 120 days",
        water: "Medium",
        costPerAcre: 28000
    },
    {
        name: "Groundnut",
        seasons: ["Kharif", "Rabi"],
        duration: "100 - 130 days",
        water: "Low to medium",
        costPerAcre: 32000
    },
    {
        name: "Millets (Ragi / Bajra / Jowar)",
        seasons: ["Kharif", "Rabi"],
        duration: "70 - 120 days",
        water: "Low",
        costPerAcre: 18000
    },
    {
        name: "Pulses (Gram / Tur / Urad)",
        seasons: ["Kharif", "Rabi"],
        duration: "90 - 180 days",
        water: "Low",
        costPerAcre: 20000
    },
    {
        name: "Vegetables",
        seasons: ["Kharif", "Rabi", "Zaid"],
        duration: "60 - 120 days",
        water: "Medium",
        costPerAcre: 50000
    },
    {
        name: "Banana",
        seasons: ["Annual"],
        duration: "10 - 12 months",
        water: "High",
        costPerAcre: 90000
    },
    {
        name: "Turmeric",
        seasons: ["Kharif"],
        duration: "7 - 9 months",
        water: "Medium",
        costPerAcre: 85000
    }
];

/* =====================================================
   FIELD DEFINITIONS
===================================================== */

const personalFields = [
    {
        name: "fullName",
        label: "Full name",
        type: "text",
        placeholder: "Enter farmer's full name"
    },
    {
        name: "email",
        label: "Email address",
        type: "email",
        placeholder: "Enter email address"
    },
    {
        name: "phone",
        label: "Phone number",
        type: "tel",
        placeholder: "Enter 10-digit mobile number",
        maxLength: 10,
        inputMode: "numeric"
    },
    {
        name: "village",
        label: "Village",
        type: "text",
        placeholder: "Enter village name"
    },
    {
        name: "district",
        label: "District",
        type: "text",
        placeholder: "Enter district name"
    },
    {
        name: "state",
        label: "State",
        type: "select",
        placeholder: "Select state"
    }
];

const farmFields = [
    {
        name: "cropType",
        label: "Crop type",
        type: "select",
        placeholder: "Select crop"
    },
    {
        name: "landArea",
        label: "Land area (acres)",
        type: "number",
        placeholder: "Enter land area",
        min: 0.01,
        step: "any"
    }
];

const loanFields = [
    {
        name: "loanAmount",
        label: "Loan amount (₹)",
        type: "number",
        placeholder: "Enter loan amount",
        min: 1,
        step: "any"
    }
];

const allFields = [...personalFields, ...farmFields, ...loanFields];

const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    village: "",
    district: "",
    state: "",
    cropType: "",
    landArea: "",
    loanAmount: ""
};

/* =====================================================
   HELPERS
===================================================== */

const money = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(value);

// Kharif: Jun-Oct | Rabi: Nov-Mar | Zaid: Apr-May
const getCurrentSeason = () => {
    const month = new Date().getMonth();

    if (month >= 5 && month <= 9) return "Kharif";
    if (month === 3 || month === 4) return "Zaid";
    return "Rabi";
};

// Based on the Agricultural Census land-holding classes.
const getFarmerCategory = (hectares) => {
    if (hectares < 1) return "Marginal farmer";
    if (hectares < 2) return "Small farmer";
    if (hectares < 4) return "Semi-medium farmer";
    if (hectares < 10) return "Medium farmer";
    return "Large farmer";
};

const ReviewItem = ({ label, value }) => (
    <div className="field af-review-field">
        <span>{label}</span>
        <strong>{value || "—"}</strong>
    </div>
);

/* =====================================================
   COMPONENT
===================================================== */

const AddFarmer = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState(initialForm);
    const [customCrop, setCustomCrop] = useState(false);
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [draftLoaded, setDraftLoaded] = useState(false);

    // Restore an existing draft.
    useEffect(() => {
        try {
            const savedDraft = localStorage.getItem(DRAFT_KEY);

            if (savedDraft) {
                const restored = {
                    ...initialForm,
                    ...JSON.parse(savedDraft)
                };

                setForm(restored);

                // A crop that is not in the list was typed manually.
                if (
                    restored.cropType &&
                    !CROPS.some((crop) => crop.name === restored.cropType)
                ) {
                    setCustomCrop(true);
                }
            }
        } catch (err) {
            console.error("Could not restore draft:", err);
        } finally {
            setDraftLoaded(true);
        }
    }, []);

    // Save draft after restoring the previous draft.
    useEffect(() => {
        if (!draftLoaded || status !== "idle") {
            return;
        }

        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        } catch (err) {
            console.error("Could not save draft:", err);
        }
    }, [form, status, draftLoaded]);

    const handleChange = (e) => {
        const { name } = e.target;
        let { value } = e.target;

        // Phone number accepts digits only.
        if (name === "phone") {
            value = value.replace(/\D/g, "").slice(0, 10);
        }

        setForm((current) => ({
            ...current,
            [name]: value
        }));

        setError("");
    };

    const handleCropChange = (e) => {
        const { value } = e.target;

        if (value === OTHER_CROP) {
            setCustomCrop(true);
            setForm((current) => ({ ...current, cropType: "" }));
        } else {
            setCustomCrop(false);
            setForm((current) => ({ ...current, cropType: value }));
        }

        setError("");
    };

    const handleClear = () => {
        if (status !== "idle") {
            return;
        }

        setForm(initialForm);
        setCustomCrop(false);
        setError("");

        try {
            localStorage.removeItem(DRAFT_KEY);
        } catch (err) {
            console.error("Could not clear draft:", err);
        }
    };

    /* ---------- Progress ---------- */

    const filled = allFields.filter((field) =>
        String(form[field.name] ?? "").trim()
    ).length;

    const progress = Math.round((filled / allFields.length) * 100);

    /* ---------- Farm insights (frontend only) ---------- */

    const currentSeason = getCurrentSeason();

    const selectedCrop =
        CROPS.find((crop) => crop.name === form.cropType) || null;

    const acres = Number(form.landArea);
    const hasLand = Number.isFinite(acres) && acres > 0;

    const hectares = hasLand ? acres * ACRE_TO_HECTARE : null;
    const cents = hasLand ? acres * ACRE_TO_CENTS : null;
    const farmerCategory =
        hectares !== null ? getFarmerCategory(hectares) : null;

    const inSeason = selectedCrop
        ? selectedCrop.seasons.includes("Annual") ||
          selectedCrop.seasons.includes(currentSeason)
        : false;

    const suggestedLoan =
        selectedCrop && hasLand
            ? Math.max(
                  100,
                  Math.round((selectedCrop.costPerAcre * acres) / 100) * 100
              )
            : null;

    const loanNumber = Number(form.loanAmount);
    const hasLoan = Number.isFinite(loanNumber) && loanNumber > 0;

    const loanPerAcre = hasLoan && hasLand ? loanNumber / acres : null;

    const loanIsHigh =
        suggestedLoan !== null && hasLoan && loanNumber > suggestedLoan * 1.25;

    const landText =
        hectares !== null
            ? `${hectares.toFixed(2)} ha / ${cents.toFixed(0)} cents`
            : "";

    /* ---------- Validation ---------- */

    const validateForm = () => {
        for (const field of allFields) {
            if (!String(form[field.name] ?? "").trim()) {
                const verb = field.type === "select" ? "select" : "enter";
                return `Please ${verb} ${field.label.toLowerCase()}.`;
            }
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
            return "Please enter a valid email address.";
        }

        if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
            return "Enter a valid 10-digit Indian mobile number.";
        }

        if (!Number.isFinite(Number(form.landArea)) ||
            Number(form.landArea) <= 0) {
            return "Land area must be greater than zero.";
        }

        if (!Number.isFinite(Number(form.loanAmount)) ||
            Number(form.loanAmount) <= 0) {
            return "Loan amount must be greater than zero.";
        }

        return "";
    };

    /* ---------- EMI (reducing-balance formula) ---------- */

    const calculateEmi = () => {
        const principal = Number(form.loanAmount);

        if (!Number.isFinite(principal) || principal <= 0) {
            return null;
        }

        const months = DEFAULT_LOAN_DURATION;
        const monthlyRate = DEFAULT_INTEREST_RATE / 12 / 100;
        const factor = Math.pow(1 + monthlyRate, months);

        return (principal * monthlyRate * factor) / (factor - 1);
    };

    const emi = calculateEmi();

    const totalPayment =
        emi !== null ? emi * DEFAULT_LOAN_DURATION : null;

    const totalInterest =
        totalPayment !== null
            ? totalPayment - Number(form.loanAmount)
            : null;

    /* ---------- Submit handlers (backend logic unchanged) ---------- */

    const handleReview = (e) => {
        e.preventDefault();

        const validationMessage = validateForm();

        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        setError("");
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (status !== "idle") {
            return;
        }

        const validationMessage = validateForm();

        if (validationMessage) {
            setError(validationMessage);
            setStep(1);
            return;
        }

        setError("");
        setStatus("saving");

        try {
            // Step 1: Register the farmer.
            const farmerResponse = await addFarmer({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                village: form.village.trim(),
                district: form.district.trim(),
                state: form.state.trim(),
                landArea: Number(form.landArea),
                cropType: form.cropType.trim()
            });

            const farmerId = farmerResponse?.data?.id;

            if (farmerId == null) {
                throw new Error(
                    "Farmer response did not contain an ID. Check the backend response."
                );
            }

            // Step 2: Register the loan.
            await addLoan(farmerId, {
                loanAmount: Number(form.loanAmount),
                loanDuration: DEFAULT_LOAN_DURATION,
                intrestrate: DEFAULT_INTEREST_RATE,
                loanStatus: "PENDING"
            });

            localStorage.removeItem(DRAFT_KEY);

            setStatus("done");

            navigate("/farmers", {
                state: {
                    applicationSaved: true
                }
            });
        } catch (err) {
            console.error("Application submission error:", err);
            console.error("Backend response:", err.response?.data);

            const data = err.response?.data;

            setError(
                typeof data === "string"
                    ? data
                    : data?.message ||
                      err.message ||
                      "Could not save the application. Please try again."
            );

            setStatus("idle");
        }
    };

    /* ---------- Field renderer ---------- */

    const stateOptions =
        form.state && !INDIAN_STATES.includes(form.state)
            ? [form.state, ...INDIAN_STATES]
            : INDIAN_STATES;

    const renderField = (field) => {
        const disabled = status !== "idle";

        if (field.type === "select") {
            const isCrop = field.name === "cropType";

            const options = isCrop
                ? CROPS.map((crop) => crop.name)
                : stateOptions;

            const selectValue = isCrop
                ? customCrop
                    ? OTHER_CROP
                    : form.cropType
                : form[field.name];

            return (
                <div className="field" key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>

                    <select
                        id={field.name}
                        name={field.name}
                        value={selectValue}
                        onChange={isCrop ? handleCropChange : handleChange}
                        required
                        disabled={disabled}
                    >
                        <option value="">{field.placeholder}</option>

                        {options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}

                        {isCrop && (
                            <option value={OTHER_CROP}>Other crop</option>
                        )}
                    </select>

                    {isCrop && customCrop && (
                        <input
                            id="customCrop"
                            name="cropType"
                            type="text"
                            placeholder="Enter crop name"
                            aria-label="Other crop name"
                            value={form.cropType}
                            onChange={handleChange}
                            required
                            disabled={disabled}
                        />
                    )}
                </div>
            );
        }

        return (
            <div className="field" key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>

                <input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={form[field.name]}
                    onChange={handleChange}
                    min={field.min}
                    maxLength={field.maxLength}
                    step={field.step}
                    inputMode={field.inputMode}
                    required
                    disabled={disabled}
                />
            </div>
        );
    };

    /* ---------- Render ---------- */

    return (
        <main className="af">
            <form
                className="af-card"
                onSubmit={step === 1 ? handleReview : handleSubmit}
            >
                <header className="af-head">
                    <div className="af-heading">
                        <span className="af-eyebrow">
                            AGROCONNECT / APPLICATION
                        </span>

                        <h1>Farmer and Loan Application</h1>

                        <p>
                            Enter farmer details, view the loan estimate and
                            review before submitting.
                        </p>
                    </div>

                    <div className="af-meta">
                        <div className="af-step-label">
                            <span className="af-step-number">{step}</span>

                            <div>
                                <strong>
                                    {step === 1
                                        ? "Enter application details"
                                        : "Review your application"}
                                </strong>

                                <small>Step {step} of 2</small>
                            </div>
                        </div>

                        <div
                            className="af-progress"
                            role="progressbar"
                            aria-valuenow={progress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label="Form completion"
                        >
                            <div className="af-progress-top">
                                <span>Form completion</span>
                                <strong>{progress}%</strong>
                            </div>

                            <div className="grow-track">
                                <div
                                    className="grow-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            <small>
                                {filled} of {allFields.length} fields
                                completed. Draft saves automatically on this
                                device.
                            </small>
                        </div>
                    </div>
                </header>

                {step === 1 ? (
                    <>
                        {/* ---------- Farmer details ---------- */}
                        <fieldset className="af-section">
                            <legend>Farmer details</legend>

                            <div className="af-grid">
                                {personalFields.map(renderField)}
                            </div>
                        </fieldset>

                        {/* ---------- Farm details ---------- */}
                        <fieldset className="af-section">
                            <legend>Farm details</legend>

                            <div className="af-grid">
                                {farmFields.map(renderField)}
                            </div>

                            {(selectedCrop || hasLand) && (
                                <div
                                    className="af-insights"
                                    aria-live="polite"
                                >
                                    {hasLand && (
                                        <>
                                            <div className="af-insight">
                                                <span>Land area</span>
                                                <strong>{landText}</strong>
                                            </div>

                                            <div className="af-insight">
                                                <span>Farmer category</span>
                                                <strong>
                                                    {farmerCategory}
                                                </strong>
                                            </div>
                                        </>
                                    )}

                                    {selectedCrop && (
                                        <>
                                            <div className="af-insight">
                                                <span>Crop season</span>
                                                <strong>
                                                    {selectedCrop.seasons.join(
                                                        " / "
                                                    )}
                                                    <span
                                                        className={
                                                            inSeason
                                                                ? "af-badge"
                                                                : "af-badge af-badge-off"
                                                        }
                                                    >
                                                        {inSeason
                                                            ? "In season now"
                                                            : `Now: ${currentSeason}`}
                                                    </span>
                                                </strong>
                                            </div>

                                            <div className="af-insight">
                                                <span>Crop duration</span>
                                                <strong>
                                                    {selectedCrop.duration}
                                                </strong>
                                            </div>

                                            <div className="af-insight">
                                                <span>Water need</span>
                                                <strong>
                                                    {selectedCrop.water}
                                                </strong>
                                            </div>

                                            <div className="af-insight">
                                                <span>
                                                    Approx. cost per acre
                                                </span>
                                                <strong>
                                                    {money(
                                                        selectedCrop.costPerAcre
                                                    )}
                                                </strong>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </fieldset>

                        {/* ---------- Loan details ---------- */}
                        <fieldset className="af-section">
                            <legend>Loan details</legend>

                            <div className="af-grid">
                                {loanFields.map(renderField)}

                                <div className="field">
                                    <span className="af-label">
                                        Loan terms
                                    </span>

                                    <div className="af-readonly">
                                        {DEFAULT_LOAN_DURATION} months at{" "}
                                        {DEFAULT_INTEREST_RATE}% per year
                                    </div>
                                </div>
                            </div>

                            {suggestedLoan !== null && (
                                <div className="af-suggest">
                                    <p>
                                        Approx. cultivation cost for{" "}
                                        {acres} acre
                                        {acres === 1 ? "" : "s"} of{" "}
                                        {selectedCrop.name}:{" "}
                                        <strong>{money(suggestedLoan)}</strong>
                                    </p>

                                    <button
                                        type="button"
                                        className="af-button af-button-secondary af-button-small"
                                        onClick={() =>
                                            setForm((current) => ({
                                                ...current,
                                                loanAmount:
                                                    String(suggestedLoan)
                                            }))
                                        }
                                        disabled={status !== "idle"}
                                    >
                                        Use this amount
                                    </button>
                                </div>
                            )}

                            {loanIsHigh && (
                                <p className="af-warning" role="status">
                                    The loan amount is well above the
                                    approximate cultivation cost for this
                                    crop and land area. The lender may ask
                                    for supporting details.
                                </p>
                            )}

                            {suggestedLoan !== null && (
                                <small className="af-note">
                                    Crop details and cost figures are rough
                                    guides only. Actual costs and the
                                    approved amount depend on your district,
                                    season and the lender's scale of finance.
                                </small>
                            )}
                        </fieldset>

                        {/* ---------- Loan estimate ---------- */}
                        <section
                            className="af-section af-estimate"
                            aria-live="polite"
                        >
                            <div className="af-section-heading">
                                <div>
                                    <span className="af-eyebrow">
                                        FINANCIAL OVERVIEW
                                    </span>

                                    <h2>Loan estimate</h2>
                                </div>

                                <span className="af-estimate-icon">₹</span>
                            </div>

                            {emi !== null ? (
                                <>
                                    <div className="af-estimate-grid">
                                        <div className="af-stat">
                                            <span>
                                                Estimated monthly EMI
                                            </span>
                                            <strong>{money(emi)}</strong>
                                        </div>

                                        <div className="af-stat">
                                            <span>
                                                Estimated total interest
                                            </span>
                                            <strong>
                                                {money(totalInterest)}
                                            </strong>
                                        </div>

                                        <div className="af-stat">
                                            <span>Total repayment</span>
                                            <strong>
                                                {money(totalPayment)}
                                            </strong>
                                        </div>

                                        <div className="af-stat">
                                            <span>Loan per acre</span>
                                            <strong>
                                                {loanPerAcre !== null
                                                    ? money(loanPerAcre)
                                                    : "—"}
                                            </strong>
                                        </div>
                                    </div>

                                    <p className="af-muted">
                                        Duration: {DEFAULT_LOAN_DURATION}{" "}
                                        months | Interest rate:{" "}
                                        {DEFAULT_INTEREST_RATE}% per year
                                    </p>
                                </>
                            ) : (
                                <p className="af-muted">
                                    Enter the loan amount to view your
                                    estimated monthly EMI.
                                </p>
                            )}

                            <small className="af-note">
                                This is an estimate only. Actual repayment may
                                differ depending on the lender's calculation
                                method and applicable charges.
                            </small>
                        </section>

                        <div className="af-actions">
                            <button
                                type="button"
                                className="af-button af-button-secondary"
                                onClick={handleClear}
                                disabled={status !== "idle"}
                            >
                                Clear form
                            </button>

                            <button
                                type="submit"
                                className="af-button af-button-primary"
                                disabled={!draftLoaded}
                            >
                                Review application
                                <span aria-hidden="true">→</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <section className="af-section">
                            <h2 className="af-legend">
                                Review farmer details
                            </h2>

                            <div className="af-grid">
                                {personalFields.map((field) => (
                                    <ReviewItem
                                        key={field.name}
                                        label={field.label}
                                        value={form[field.name]}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="af-section">
                            <h2 className="af-legend">Review farm details</h2>

                            <div className="af-grid">
                                <ReviewItem
                                    label="Crop type"
                                    value={form.cropType}
                                />

                                <ReviewItem
                                    label="Land area (acres)"
                                    value={form.landArea}
                                />

                                <ReviewItem
                                    label="Land area (hectares / cents)"
                                    value={landText}
                                />

                                <ReviewItem
                                    label="Farmer category"
                                    value={farmerCategory}
                                />
                            </div>
                        </section>

                        <section className="af-section">
                            <h2 className="af-legend">
                                Review loan details
                            </h2>

                            <div className="af-grid">
                                <ReviewItem
                                    label="Loan amount"
                                    value={money(Number(form.loanAmount))}
                                />

                                <ReviewItem
                                    label="Loan duration"
                                    value={`${DEFAULT_LOAN_DURATION} months`}
                                />

                                <ReviewItem
                                    label="Interest rate"
                                    value={`${DEFAULT_INTEREST_RATE}% per year`}
                                />

                                <ReviewItem
                                    label="Application status"
                                    value="Pending approval"
                                />

                                {emi !== null && (
                                    <>
                                        <ReviewItem
                                            label="Estimated monthly EMI"
                                            value={money(emi)}
                                        />

                                        <ReviewItem
                                            label="Estimated total repayment"
                                            value={money(totalPayment)}
                                        />
                                    </>
                                )}
                            </div>
                        </section>

                        <div className="af-actions">
                            <button
                                type="button"
                                className="af-button af-button-secondary"
                                onClick={() => {
                                    setError("");
                                    setStep(1);
                                }}
                                disabled={status !== "idle"}
                            >
                                ← Edit details
                            </button>

                            <button
                                type="submit"
                                className="af-button af-button-primary"
                                disabled={status !== "idle"}
                            >
                                {status === "saving"
                                    ? "Saving application..."
                                    : "Confirm and submit"}
                            </button>
                        </div>
                    </>
                )}

                {error && (
                    <div className="af-error" role="alert">
                        {error}
                    </div>
                )}

                {status === "saving" && (
                    <p className="af-saving" role="status">
                        Please wait while your application is being saved.
                    </p>
                )}
            </form>
        </main>
    );
};

export default AddFarmer;