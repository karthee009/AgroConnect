import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllLoans } from "../services/LoanService";
import { getAllFarmers } from "../services/FarmerService";
import {
    FaUsers,
    FaMoneyBillWave,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSyncAlt
} from "react-icons/fa";

import "./Dashboard.css";

/* Counts up from 0 to target when the value changes */
const useCountUp = (target, duration = 1200) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce || target === 0) {
            setValue(target);
            return;
        }
        let frame;
        const start = performance.now();
        const tick = (now) => {
            const t = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - t, 3);
            setValue(Math.round(target * eased));
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, duration]);

    return value;
};

const Counter = ({ value }) => <>{useCountUp(value)}</>;

/* Rows of crops that grow in, then sway */
const CropField = () => {
    const rows = [
        { y: 0, count: 26, h: 34, shade: "crop-far" },
        { y: 1, count: 20, h: 48, shade: "crop-mid" },
        { y: 2, count: 14, h: 66, shade: "crop-near" }
    ];

    return (
        <div className="crop-field" aria-hidden="true">
            {rows.map((row) => (
                <div key={row.y} className={`crop-row ${row.shade}`}>
                    {Array.from({ length: row.count }).map((_, i) => (
                        <span
                            key={i}
                            className="crop"
                            style={{
                                height: row.h + (i % 3) * 6,
                                animationDelay: `${0.4 + row.y * 0.25 + i * 0.045}s, ${
                                    1.8 + (i % 5) * 0.3
                                }s`
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

/* Animated donut for loan status split */
const LoanDonut = ({ approved, pending, rejected, drawn }) => {
    const r = 62;
    const C = 2 * Math.PI * r;
    const total = approved + pending + rejected;

    const segments = [
        { key: "approved", value: approved },
        { key: "pending", value: pending },
        { key: "rejected", value: rejected }
    ];

    let offset = 0;
    const arcs = segments.map((s) => {
        const len = total ? (s.value / total) * C : 0;
        const arc = { ...s, len, offset };
        offset += len;
        return arc;
    });

    const rate = total ? Math.round((approved / total) * 100) : 0;
    const shownRate = useCountUp(drawn ? rate : 0, 1400);

    return (
        <div className="donut-wrap">
            <svg viewBox="0 0 160 160" className="donut" role="img"
                aria-label={`${rate}% of loans approved`}>
                <circle cx="80" cy="80" r={r} className="donut-track" />
                {arcs.map((a) => (
                    <circle
                        key={a.key}
                        cx="80"
                        cy="80"
                        r={r}
                        className={`donut-arc arc-${a.key}`}
                        strokeDasharray={`${drawn ? a.len : 0} ${C}`}
                        strokeDashoffset={-a.offset}
                    />
                ))}
            </svg>
            <div className="donut-center">
                <strong>{shownRate}%</strong>
                <span>approved</span>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [farmers, setFarmers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [drawn, setDrawn] = useState(false);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError(false);
        setDrawn(false);
        try {
            const [farmerResponse, loanResponse] = await Promise.all([
                getAllFarmers(),
                getAllLoans()
            ]);
            setFarmers(farmerResponse.data);
            setLoans(loanResponse.data);
            setTimeout(() => setDrawn(true), 150);
        } catch (err) {
            console.error("Dashboard Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    const count = (status) => loans.filter((l) => l.loanStatus === status).length;
    const pendingLoans = count("PENDING");
    const approvedLoans = count("APPROVED");
    const rejectedLoans = count("REJECTED");

    const cards = [
        { cls: "farmers", icon: <FaUsers />, label: "Total farmers", value: farmers.length, to: "/farmers", cta: "View farmers" },
        { cls: "loans", icon: <FaMoneyBillWave />, label: "Total loans", value: loans.length, to: "/farmers/loan", cta: "View loans" },
        { cls: "pending", icon: <FaClock />, label: "Pending loans", value: pendingLoans, note: "Waiting for approval" },
        { cls: "approved", icon: <FaCheckCircle />, label: "Approved loans", value: approvedLoans, note: "Money released to farmers" },
        { cls: "rejected", icon: <FaTimesCircle />, label: "Rejected loans", value: rejectedLoans, note: "Applications declined" }
    ];

    return (
        <div className="dash">
            {/* ===== Hero ===== */}
            <header className="dash-hero">
                <div className="sun" aria-hidden="true" />
                <div className="cloud cloud-a" aria-hidden="true" />
                <div className="cloud cloud-b" aria-hidden="true" />
                <div className="hill hill-back" aria-hidden="true" />
                <div className="hill hill-front" aria-hidden="true" />
                <CropField />

                <div className="hero-copy">
                    <p className="hero-kicker">AgroConnect admin</p>
                    <h1>Your farmers are growing.</h1>
                    <p className="hero-sub">
                        <strong>{loading ? "–" : <Counter value={farmers.length} />}</strong>{" "}
                        farmers registered ·{" "}
                        <strong>{loading ? "–" : <Counter value={pendingLoans} />}</strong>{" "}
                        loans need your decision
                    </p>
                </div>

                <button
                    className="refresh"
                    onClick={loadDashboard}
                    disabled={loading}
                    aria-label="Refresh dashboard"
                >
                    <FaSyncAlt className={loading ? "spin" : ""} />
                    Refresh
                </button>
            </header>

            {error && (
                <div className="dash-error" role="alert">
                    Couldn't load the dashboard data. Check that the server is running, then
                    press Refresh.
                </div>
            )}

            {/* ===== Stat cards ===== */}
            <section className="dash-stats">
                {cards.map((c) => (
                    <article key={c.cls} className={`stat stat-${c.cls} ${loading ? "is-loading" : ""}`}>
                        <div className="stat-icon">{c.icon}</div>
                        <p className="stat-label">{c.label}</p>
                        <h2 className="stat-value">
                            {loading ? "" : <Counter value={c.value} />}
                        </h2>
                        {c.to ? (
                            <Link to={c.to} className="stat-link">
                                {c.cta}
                            </Link>
                        ) : (
                            <span className="stat-note">{c.note}</span>
                        )}
                    </article>
                ))}
            </section>

            {/* ===== Loan summary ===== */}
            <section className="dash-summary">
                <div className="summary-head">
                    <h3>Loan summary</h3>
                    <p>How every application is doing right now</p>
                </div>

                <div className="summary-body">
                    <LoanDonut
                        approved={approvedLoans}
                        pending={pendingLoans}
                        rejected={rejectedLoans}
                        drawn={drawn}
                    />

                    <ul className="summary-list">
                        {[
                            { k: "approved", label: "Approved", v: approvedLoans },
                            { k: "pending", label: "Pending", v: pendingLoans },
                            { k: "rejected", label: "Rejected", v: rejectedLoans }
                        ].map((row) => {
                            const pct = loans.length ? (row.v / loans.length) * 100 : 0;
                            return (
                                <li key={row.k}>
                                    <div className="row-top">
                                        <span className={`dot dot-${row.k}`} />
                                        <span className="row-label">{row.label}</span>
                                        <strong>{row.v}</strong>
                                    </div>
                                    <div className="bar">
                                        <div
                                            className={`bar-fill fill-${row.k}`}
                                            style={{ width: drawn ? `${pct}%` : "0%" }}
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default Dashboard;