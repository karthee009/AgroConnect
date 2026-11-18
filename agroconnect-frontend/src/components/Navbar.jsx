import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { logoutUser } from "../services/AuthService";

function Navbar() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    useEffect(() => {

        const loggedUser = JSON.parse(
            localStorage.getItem("user")
        );

        setUser(loggedUser);

    }, []);

    const handleLogout = async () => {

        try { await logoutUser(); } catch (error) { console.warn("Session logout request failed", error); }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isLoggedIn");

        setUser(null);

        navigate("/");
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">

            <div className="container">

                <NavLink className="navbar-brand" to="/">
                    AgroConnect
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="navbarNav"
                >

                    <ul className="navbar-nav ms-auto">

                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/home"
                            >
                                Home
                            </NavLink>
                        </li>


                        <li className="nav-item">
                            <NavLink className="nav-link" to="/farm-tools">Farm Tools</NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/farmers"
                            >
                                Farmers
                            </NavLink>
                        </li>


                        <li className="nav-item">
                            <NavLink
                                className="nav-link"
                                to="/add-farmers"
                            >
                                Add Loan
                            </NavLink>
                        </li>


                        {/* ADMIN மட்டும் Dashboard */}
                        {user?.role === "ADMIN" && (

                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    to="/dashboard"
                                >
                                    Dashboard
                                </NavLink>
                            </li>

                        )}


                        {/* USER மட்டும் My Dashboard */}
                        {user?.role === "USER" && (

                            <li className="nav-item">
                                <NavLink
                                    className="nav-link"
                                    to="/user-dashboard"
                                >
                                    My Dashboard
                                </NavLink>
                            </li>

                        )}


                        <li className="nav-item ms-2">

                            <button
                                className="btn btn-outline-success"
                                onClick={handleLogout}
                            >
                                🚪 Logout
                            </button>

                        </li>

                    </ul>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;