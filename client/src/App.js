import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FamilyMembersList from "./components/FamilyMembersList";
import MemberDetail from "./components/MemberDetail";
import Navbar from "./components/page-parts/Navbar";
import MemberForm from "./components/MemberForm";
import HomePage from "./components/HomePage";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/form" element={<MemberForm />} />
          <Route path="/form/:id" element={<MemberForm />} />
          <Route path="/clenove" element={<FamilyMembersList />} />
          <Route path="/clenove/:id" element={<MemberDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
