import Navbar from "./components/Navbar";
import AddFarmer from "./pages/AddFarmer";
import Editfarmer from "./pages/EditFarmer";
import FarmerList from "./pages/FarmerList";
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LoanList from "./pages/LoanList";
import EditLoan from "./pages/EditLoan";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
import FarmTools from "./pages/FarmTools";




function AppContent() {

  const location = useLocation();

  return (
    <>
      {/* Login page-la Navbar varakoodadhu */}
      {location.pathname !== "/" && <Navbar />}

      <Routes>
        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Home */}
        <Route path="/home" element={<Home />} />

        {/* Farmer */}
        <Route path="/farmers" element={<FarmerList />} />

        <Route path="/add-farmers" element={<AddFarmer />} />

         <Route path="/edit-farmers/:id" element={<Editfarmer />} /> 

        {/* <Route path="/farmers/edit/:id" element={<Editfarmer />}/> */}

        {/* Loan */}
        <Route path="/farmers/loan" element={<LoanList />} />

        <Route path="/edit-loan/:loanId" element={<EditLoan />}/>
        {/*dashboard*/ }
        <Route path="/dashboard" element={<Dashboard />} />

        {/*user dashboarduhhhh*/}
        <Route  path="/user-dashboard" element={<UserDashboard />}/>
        <Route path="/farm-tools" element={<FarmTools />} />
      </Routes>
    </>
  );
}

function App() {

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;