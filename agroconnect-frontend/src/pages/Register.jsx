import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { registerUser } from "../services/AuthService";

const Register = () => {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        village: "",
        district: "",
        state: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {

        const userData = {
            name: form.fullName,
            email: form.email,
            password: form.password,
            phone: form.phone,
            village: form.village,
            district: form.district,
            state: form.state
        };

        const response = await registerUser(userData);

        console.log("Registration Response:", response.data);

        alert("Registration successful!");

        navigate("/");

    } catch (error) {

        console.error("Registration Error:", error);

        alert(
            error.response?.data || "Registration failed"
        );
    }
};

    return (
        <div style={styles.container}>

            <div style={styles.card}>

                <h2 style={styles.title}>AgroConnect</h2>
                <p style={styles.subtitle}>Create your account</p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={form.phone}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="text"
                        name="village"
                        placeholder="Village"
                        value={form.village}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="text"
                        name="district"
                        placeholder="District"
                        value={form.district}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={form.state}
                        onChange={handleChange}
                        style={styles.input}
                        required
                    />

                    <button type="submit" style={styles.button}>
                        Register
                    </button>

                </form>

                {message && (
                    <p style={styles.message}>{message}</p>
                )}

                <p style={styles.loginText}>
                    Already have an account?{" "}
                    <span
                        style={styles.loginLink}
                        onClick={() => navigate("/")}
                    >
                        Login
                    </span>
                </p>

            </div>

        </div>
    );
};

const styles = {

    container: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f1f8e9"
    },

    card: {
        width: "400px",
        padding: "30px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 5px 20px rgba(0,0,0,0.15)"
    },

    title: {
        textAlign: "center",
        color: "#2e7d32",
        marginBottom: "5px"
    },

    subtitle: {
        textAlign: "center",
        color: "#666",
        marginBottom: "20px"
    },

    input: {
        width: "100%",
        padding: "12px",
        marginBottom: "12px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        boxSizing: "border-box"
    },

    button: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#2e7d32",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "16px"
    },

    message: {
        textAlign: "center",
        marginTop: "15px",
        color: "#2e7d32"
    },

    loginText: {
        textAlign: "center",
        marginTop: "20px"
    },

    loginLink: {
        color: "#2e7d32",
        cursor: "pointer",
        fontWeight: "bold"
    }
};

export default Register;