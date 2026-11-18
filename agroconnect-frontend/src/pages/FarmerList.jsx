import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllFarmers, deleteFarmer } from "../services/FarmerService";

import "./FarmerList.css";

const TONES = ["tone-a", "tone-b", "tone-c", "tone-d", "tone-e"];

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "?";

const toneFor = (name = "") =>
    TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length];

const readUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
};

function FarmerList() {
    const [farmers, setFarmers] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [query, setQuery] = useState("");

    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [removingId, setRemovingId] = useState(null);
    const [toast, setToast] = useState(null);

    const isAdmin = user?.role === "ADMIN";

    const loadFarmers = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const response = await getAllFarmers();
            setFarmers(response.data);
        } catch (err) {
            console.error("Farmer Error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setUser(readUser());
        loadFarmers();
    }, [loadFarmers]);

    /* auto-hide toast */
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 3200);
        return () => clearTimeout(t);
    }, [toast]);

    /* close the delete dialog with Escape */
    useEffect(() => {
        if (!pendingDelete) return;
        const onKey = (e) => e.key === "Escape" && !deleting && setPendingDelete(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [pendingDelete, deleting]);

    const confirmDelete = async () => {
        const farmer = pendingDelete;
        setDeleting(true);
        try {
            await deleteFarmer(farmer.id);
            setPendingDelete(null);
            setRemovingId(farmer.id);
            // let the row slide away, then drop it from the list
            setTimeout(() => {
                setFarmers((list) => list.filter((f) => f.id !== farmer.id));
                setRemovingId(null);
            }, 450);
            setToast({ type: "ok", text: `${farmer.fullName} was deleted.` });
        } catch (err) {
            console.error("Delete Error:", err);
            setPendingDelete(null);
            setToast({ type: "bad", text: "Couldn't delete the farmer. Try again." });
        } finally {
            setDeleting(false);
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return farmers;
        return farmers.filter((f) =>
            [f.fullName, f.email, f.phone, f.village, f.district, f.state, f.cropType]
                .join(" ")
                .toLowerCase()
                .includes(q)
        );
    }, [farmers, query]);

    const totalAcres = farmers.reduce((sum, f) => sum + (Number(f.landArea) || 0), 0);
    const districts = new Set(farmers.map((f) => f.district).filter(Boolean)).size;

    const colSpan = isAdmin ? 8 : 7;

    return (
        <div className="fl">
            {/* ===== Agriculture animation background ===== */}
            <div className="agri-bg" aria-hidden="true">
                <span className="sun"></span>
                <span className="cloud cloud-one"></span>
                <span className="cloud cloud-two"></span>
                <span className="leaf-float leaf-one">🌿</span>
                <span className="leaf-float leaf-two">🍃</span>
                <span className="leaf-float leaf-three">🌱</span>
                <span className="field-line field-line-one"></span>
                <span className="field-line field-line-two"></span>
                <span className="field-line field-line-three"></span>
            </div>

            {/* ===== Header ===== */}
            <header className="fl-head">
                <div>
                    <Link to="/home" className="fl-back">← Back to home</Link>
                    <h1>Farmers</h1>
                    <p>Everyone registered on AgroConnect</p>
                </div>

                <div className="fl-head-actions">
                    <Link to="/farmers/loan" className="btn-ghost">View loans</Link>
                    <Link to="/add-farmers" className="btn-solid">Add farmer</Link>
                </div>
            </header>

            {/* ===== Quick numbers ===== */}
            <section className="fl-stats">
                <div><strong>{loading ? "–" : farmers.length}</strong><span>Farmers</span></div>
                <div><strong>{loading ? "–" : totalAcres.toLocaleString()}</strong><span>Acres farmed</span></div>
                <div><strong>{loading ? "–" : districts}</strong><span>Districts</span></div>
            </section>

            {/* ===== Search ===== */}
            <div className="fl-search">
                <input
                    type="search"
                    placeholder="Search by name, village, crop, phone…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search farmers"
                />
                {query && (
                    <span className="fl-count">
                        {filtered.length} of {farmers.length}
                    </span>
                )}
            </div>

            {error && (
                <div className="fl-error" role="alert">
                    Couldn't load farmers. Check that the server is running.
                    <button onClick={loadFarmers}>Try again</button>
                </div>
            )}

            {/* ===== Table ===== */}
            <div className="fl-table-wrap">
                <table className="fl-table">
                    <thead>
                        <tr>
                            <th>Farmer</th>
                            <th>Phone</th>
                            <th>Village</th>
                            <th>District</th>
                            <th>State</th>
                            <th>Crop</th>
                            <th>Land</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {loading &&
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="skeleton-row" aria-hidden="true">
                                    <td colSpan={colSpan}><span /></td>
                                </tr>
                            ))}

                        {!loading && filtered.length === 0 && (
                            <tr className="empty-row">
                                <td colSpan={colSpan}>
                                    {farmers.length === 0 ? (
                                        <>
                                            <span className="empty-icon">🌱</span>
                                            <p>No farmers yet.</p>
                                            <Link to="/add-farmers" className="btn-solid">
                                                Add the first farmer
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <span className="empty-icon">🔍</span>
                                            <p>No farmers match “{query}”.</p>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )}

                        {!loading &&
                            filtered.map((farmer, i) => (
                                <tr
                                    key={farmer.id}
                                    className={`row ${removingId === farmer.id ? "removing" : ""}`}
                                    style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
                                >
                                    <td data-label="Farmer">
                                        <div className="who">
                                            <span className={`avatar ${toneFor(farmer.fullName)}`}>
                                                {initials(farmer.fullName)}
                                            </span>
                                            <div>
                                                <strong>{farmer.fullName}</strong>
                                                <small>{farmer.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="Phone">{farmer.phone}</td>
                                    <td data-label="Village">{farmer.village}</td>
                                    <td data-label="District">{farmer.district}</td>
                                    <td data-label="State">{farmer.state}</td>
                                    <td data-label="Crop">
                                        <span className="chip">{farmer.cropType}</span>
                                    </td>
                                    <td data-label="Land">{farmer.landArea} acres</td>

                                    {isAdmin && (
                                        <td data-label="Actions">
                                            <div className="row-actions">
                                                <Link
                                                    to={`/edit-farmers/${farmer.id}`}
                                                    className="act act-edit"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    className="act act-del"
                                                    onClick={() => setPendingDelete(farmer)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* ===== Delete dialog ===== */}
            {pendingDelete && (
                <div
                    className="modal-back"
                    onClick={() => !deleting && setPendingDelete(null)}
                >
                    <div
                        className="modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="del-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="del-title">Delete {pendingDelete.fullName}?</h3>
                        <p>
                            This removes the farmer from AgroConnect. This can't be undone.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-ghost"
                                onClick={() => setPendingDelete(null)}
                                disabled={deleting}
                                autoFocus
                            >
                                Keep farmer
                            </button>
                            <button
                                className="btn-danger"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting…" : "Delete farmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Toast ===== */}
            {toast && (
                <div className={`toast toast-${toast.type}`} role="status">
                    {toast.text}
                </div>
            )}
        </div>
    );
}

export default FarmerList;