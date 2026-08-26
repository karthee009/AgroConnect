import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getFarmerById,
    updateFarmer
} from "../services/FarmerService";

import "./EditFarmer.css";

const EditFarmer = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [farmer, setFarmer] = useState({
        fullName: "",
        email: "",
        phone: "",
        village: "",
        district: "",
        state: "",
        landArea: "",
        cropType: ""
    });

    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {

        const user = JSON.parse(localStorage.getItem("user"));

        // ADMIN access check
        if (!user || user.role !== "ADMIN") {
            alert("Access Denied! Only Admin can edit farmers.");
            navigate("/farmers");
            return;
        }

        setIsAdmin(true);
        loadFarmer();

    }, [id, navigate]);

    const loadFarmer = async () => {
        try {

            const response = await getFarmerById(id);

            setFarmer(response.data);

        } catch (error) {
            console.error("Error loading farmer:", error);
            alert("Failed to load farmer details");
        }
    };

    const handleChange = (e) => {

        setFarmer({
            ...farmer,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            await updateFarmer(id, {
                ...farmer,
                landArea: Number(farmer.landArea)
            });

            alert("Farmer updated successfully!");

            navigate("/farmers");

        } catch (error) {

            console.error("Update Error:", error);

            alert(
                error.response?.data ||
                "Farmer update failed"
            );
        }
    };

    if (!isAdmin) {
        return null;
    }

    return (

        <div className="edit-farmer">

            <h2>Edit Farmer</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        value={farmer.fullName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={farmer.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={farmer.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Village</label>
                    <input
                        type="text"
                        name="village"
                        value={farmer.village}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>District</label>
                    <input
                        type="text"
                        name="district"
                        value={farmer.district}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>State</label>
                    <input
                        type="text"
                        name="state"
                        value={farmer.state}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Land Area</label>
                    <input
                        type="number"
                        name="landArea"
                        value={farmer.landArea}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Crop Type</label>
                    <input
                        type="text"
                        name="cropType"
                        value={farmer.cropType}
                        onChange={handleChange}
                        required
                    />
                </div>

                <br />

                <button type="submit">
                    Save Changes
                </button>

            </form>

        </div>
    );
};

export default EditFarmer;