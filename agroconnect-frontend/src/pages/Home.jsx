import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLoggedInUser } from "../services/AuthService";

import "./Home.css";

const CROPS = 32;

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
};

const Home = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            const response = await getLoggedInUser();
            const data = response.data;

            setUser({
                id: data.id,
                email: data.email,
                role: data.role
            });
        } catch (error) {
            console.error("Error loading user:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");

        navigate("/");
    };

    const actions = [
        { icon: "👨‍🌾", title: "Farmers", text: "View and manage farmer details", to: "/farmers" },
        { icon: "💰", title: "Loans", text: "Review and track agricultural loans", to: "/farmers/loan" },
        { icon: "🌱", title: "Add farmer", text: "Register a new farmer", to: "/add-farmers" }
    ];

    const details = user && [
        { icon: "🆔", label: "User ID", value: user.id },
        { icon: "📧", label: "Email", value: user.email },
        { icon: "🔐", label: "Role", value: user.role, role: true }
    ];

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="home-loading" role="status">
                    <div className="sprout" aria-hidden="true">🌱</div>
                    <p>Loading AgroConnect…</p>
                </div>
            </>
        );
    }

    return (
        <div className="home">
            {/* ===== Hero: a tractor plants the field once on load ===== */}
            <header className="home-hero">
                <div className="hero-text">
                    <p className="hero-greet">
                        {greeting()}{user ? `, ${user.email}` : ""}
                    </p>
                    <h1>Welcome to AgroConnect</h1>
                    <p className="hero-sub">
                        Farmers, loans and agricultural services in one place.
                    </p>
                </div>

                <div className="hero-ground" aria-hidden="true">
                    {Array.from({ length: CROPS }).map((_, i) => (
                        <span
                            key={i}
                            className="seedling"
                            style={{
                                left: `${(i / CROPS) * 100 + 1}%`,
                                height: 22 + (i % 4) * 6,
                                animationDelay: `${0.5 + (i / CROPS) * 3.3}s, ${
                                    4.5 + (i % 6) * 0.3
                                }s`
                            }}
                        />
                    ))}
                    <span className="tractor">🚜</span>
                </div>
            </header>

            {/* ===== Profile ===== */}
            {user && (
                <section className="home-card profile">
                    <div className="profile-head">
                        <div className="avatar" aria-hidden="true">👤</div>
                        <div>
                            <h2>Your account</h2>
                            <p>Details of the account you're signed in with</p>
                        </div>
                    </div>

                    <div className="profile-grid">
                        {details.map((d) => (
                            <div key={d.label} className="detail">
                                <span className="detail-icon" aria-hidden="true">{d.icon}</span>
                                <div>
                                    <small>{d.label}</small>
                                    <p className={d.role ? "role-chip" : ""}>{d.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ===== Quick access ===== */}
            <section className="quick">
                <h2>Quick access</h2>
                <p className="quick-sub">Jump straight to what you need</p>

                <div className="quick-grid">
                    {actions.map((a) => (
                        <button
                            key={a.to}
                            type="button"
                            className="action"
                            onClick={() => navigate(a.to)}
                        >
                            <span className="action-icon" aria-hidden="true">{a.icon}</span>
                            <h3>{a.title}</h3>
                            <p>{a.text}</p>
                        </button>
                    ))}
                </div>
            </section>

            <button type="button" className="logout" onClick={handleLogout}>
                Log out
            </button>
        </div>
    );
};

export default Home;