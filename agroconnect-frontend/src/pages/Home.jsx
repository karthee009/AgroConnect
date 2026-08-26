import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getLoggedInUser } from "../services/AuthService";

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

            console.log("Logged In User:", response.data);

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

    if (loading) {
        return (
            <>
                <Navbar />

                <div style={styles.loadingContainer}>
                    <div style={styles.loader}></div>
                    <h2>Loading AgroConnect...</h2>
                </div>
            </>
        );
    }

    return (
        <>

            <div style={styles.page}>

                {/* Hero Section */}
                <div style={styles.hero}>

                    <div>
                        <h1 style={styles.title}>
                            Welcome to <span style={styles.highlight}>AgroConnect</span> 🌱
                        </h1>

                        <p style={styles.subtitle}>
                            Connecting Farmers, Loans and Agricultural Services
                            in one simple platform.
                        </p>

                        {user && (
                            <div style={styles.welcomeText}>
                                Hello, <strong>{user.email}</strong> 👋
                            </div>
                        )}
                    </div>

                    <div style={styles.heroIcon}>
                        🌾
                    </div>

                </div>

                {/* User Information Card */}
                {user && (
                    <div style={styles.card}>

                        <div style={styles.cardHeader}>
                            <div style={styles.profileIcon}>
                                👤
                            </div>

                            <div>
                                <h2 style={styles.cardTitle}>
                                    User Profile
                                </h2>

                                <p style={styles.cardSubtitle}>
                                    Your AgroConnect account details
                                </p>
                            </div>
                        </div>

                        <div style={styles.details}>

                            <div style={styles.detailBox}>
                                <span style={styles.detailIcon}>🆔</span>

                                <div>
                                    <small>User ID</small>
                                    <p>{user.id}</p>
                                </div>
                            </div>

                            <div style={styles.detailBox}>
                                <span style={styles.detailIcon}>📧</span>

                                <div>
                                    <small>Email</small>
                                    <p>{user.email}</p>
                                </div>
                            </div>

                            <div style={styles.detailBox}>
                                <span style={styles.detailIcon}>🔐</span>

                                <div>
                                    <small>Role</small>
                                    <p style={styles.role}>
                                        {user.role}
                                    </p>
                                </div>
                            </div>

                        </div>

                    </div>
                )}

                {/* Quick Access */}
                <div style={styles.sectionTitle}>
                    <h2>Quick Access</h2>
                    <p>Manage your agricultural activities</p>
                </div>

                <div style={styles.cards}>

                    <div
                        style={styles.actionCard}
                        onClick={() => navigate("/farmers")}
                    >
                        <div style={styles.actionIcon}>👨‍🌾</div>
                        <h3>Farmers</h3>
                        <p>View and manage farmer details</p>
                    </div>

                    <div
                        style={styles.actionCard}
                        onClick={() => navigate("/farmers/loan")}
                    >
                        <div style={styles.actionIcon}>💰</div>
                        <h3>Loans</h3>
                        <p>View and manage agricultural loans</p>
                    </div>

                    <div
                        style={styles.actionCard}
                        onClick={() => navigate("/add-farmers")}
                    >
                        <div style={styles.actionIcon}>➕</div>
                        <h3>Add Farmer</h3>
                        <p>Register a new farmer</p>
                    </div>

                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                    onMouseOver={(e) =>
                        e.currentTarget.style.backgroundColor = "#b91c1c"
                    }
                    onMouseOut={(e) =>
                        e.currentTarget.style.backgroundColor = "#dc2626"
                    }
                >
                    🚪 Logout
                </button>

            </div>
        </>
    );
};

const styles = {

    page: {
        minHeight: "calc(100vh - 70px)",
        padding: "40px",
        background:
            "linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #eff6ff 100%)",
        fontFamily: "Arial, sans-serif"
    },

    loadingContainer: {
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#166534"
    },

    loader: {
        width: "45px",
        height: "45px",
        border: "5px solid #bbf7d0",
        borderTop: "5px solid #16a34a",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "15px"
    },

    hero: {
        maxWidth: "1100px",
        margin: "0 auto 30px",
        padding: "35px",
        borderRadius: "20px",
        background:
            "linear-gradient(135deg, #166534, #16a34a)",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(22, 101, 52, 0.25)"
    },

    title: {
        fontSize: "38px",
        margin: "0 0 12px"
    },

    highlight: {
        color: "#fde047"
    },

    subtitle: {
        fontSize: "17px",
        opacity: "0.9",
        maxWidth: "650px",
        lineHeight: "1.6"
    },

    welcomeText: {
        marginTop: "20px",
        fontSize: "16px"
    },

    heroIcon: {
        fontSize: "90px"
    },

    card: {
        maxWidth: "1100px",
        margin: "0 auto 35px",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "18px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)"
    },

    cardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        marginBottom: "25px"
    },

    profileIcon: {
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        backgroundColor: "#dcfce7",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "25px"
    },

    cardTitle: {
        margin: "0",
        color: "#166534"
    },

    cardSubtitle: {
        margin: "5px 0 0",
        color: "#6b7280"
    },

    details: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "20px"
    },

    detailBox: {
        display: "flex",
        alignItems: "center",
        gap: "15px",
        padding: "18px",
        borderRadius: "12px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e5e7eb"
    },

    detailIcon: {
        fontSize: "25px"
    },

    detailBoxSmall: {
        color: "#6b7280"
    },

    role: {
        color: "#2563eb",
        fontWeight: "bold"
    },

    sectionTitle: {
        maxWidth: "1100px",
        margin: "0 auto 20px"
    },

    sectionTitleH2: {
        color: "#166534"
    },

    cards: {
        maxWidth: "1100px",
        margin: "0 auto 35px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "25px"
    },

    actionCard: {
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "18px",
        textAlign: "center",
        cursor: "pointer",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
        transition: "transform 0.2s, box-shadow 0.2s"
    },

    actionIcon: {
        fontSize: "45px",
        marginBottom: "10px"
    },

    logoutButton: {
        display: "block",
        margin: "10px auto",
        padding: "12px 35px",
        backgroundColor: "#dc2626",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.2s"
    }
};

export default Home;