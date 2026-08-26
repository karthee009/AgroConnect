import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { loginUser, getLoggedInUser } from "../services/AuthService";

const Login = () => {

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [result, setResult] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            // Login API call
            const response = await loginUser(form);

            console.log("Login Response:", response.data);

            // Get logged-in user from session
            const userResponse = await getLoggedInUser();

            console.log("Logged In User:", userResponse.data);

            // Store only required user details
            const user = {
                id: userResponse.data.id,
                email: userResponse.data.email,
                role: userResponse.data.role
            };

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("isLoggedIn", "true");

            console.log("User Saved:", user);

            // Login successful
            navigate("/home");

        } catch (error) {

            console.log("Login Error:", error.response?.data);

            setResult(
                typeof error.response?.data === "string"
                    ? error.response.data
                    : "Invalid email or password"
            );
        }
    };

    return (
        <div className="login-container">

            <form
                className="login-form"
                onSubmit={handleSubmit}
            >

                <h2>Login</h2>

                <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                />

                <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                />

                <button type="submit">
                    Login
                </button>

                <button
                    type="button"
                    id="regbtn"
                    onClick={() => navigate("/register")}
                >
                    Register
                </button>

            </form>

            {result && (
                <div className="result">
                    <p>{result}</p>
                </div>
            )}

        </div>
    );
};

export default Login;