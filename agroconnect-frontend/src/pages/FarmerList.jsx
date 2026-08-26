import { useEffect, useState } from "react";
import {
    getAllFarmers,
    deleteFarmer
} from "../services/FarmerService";
import { Link } from "react-router-dom";

function FarmerList() {

    const [farmers, setFarmers] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {

        const loggedUser = JSON.parse(localStorage.getItem("user"));
        setUser(loggedUser);

        loadFarmers();

    }, []);

    const loadFarmers = async () => {
        try {
            const response = await getAllFarmers();
            setFarmers(response.data);

        } catch (error) {
            console.error("Farmer Error:", error);
        }
    };

    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this farmer?"
        );

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteFarmer(id);

            alert("Farmer deleted successfully");

            // Delete ஆன பிறகு list refresh
            loadFarmers();

        } catch (error) {
            console.error("Delete Error:", error);
            alert("Failed to delete farmer");
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

            <h2 className="mb-4">Farmers List</h2>

            <table className="table table-bordered table-striped">

                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Village</th>
                        <th>Crop</th>
                        <th>District</th>
                        <th>State</th>
                        <th>Land Area</th>

                        {/* ADMIN மட்டும் */}
                        {user?.role === "ADMIN" && (
                            <th>Actions</th>
                        )}
                    </tr>
                </thead>

                <tbody>

                    {farmers.map((farmer) => (

                        <tr key={farmer.id}>

                            <td>{farmer.id}</td>
                            <td>{farmer.fullName}</td>
                            <td>{farmer.email}</td>
                            <td>{farmer.phone}</td>
                            <td>{farmer.village}</td>
                            <td>{farmer.cropType}</td>
                            <td>{farmer.district}</td>
                            <td>{farmer.state}</td>
                            <td>{farmer.landArea}</td>

                            {/* ADMIN மட்டும் Edit + Delete */}
                            {user?.role === "ADMIN" && (
                                <td>
                                    <Link
                                        to={`/edit-farmers/${farmer.id}`}
                                        className="btn btn-warning btn-sm me-2"
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                            handleDelete(farmer.id)
                                        }
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
                to="/farmers/loan"
                className="btn btn-outline-success"
            >
                View Loans
            </Link>

        </div>
    );
}

export default FarmerList;