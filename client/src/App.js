import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FamilyMembersList from "./components/FamilyMembersList";
import MemberDetail from "./components/MemberDetail";
import Navbar from "./components/page-parts/Navbar";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<FamilyMembersList />} />
          <Route path="/clenove" element={<FamilyMembersList />} />
          <Route path="/clenove/:id" element={<MemberDetail />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
