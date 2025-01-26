import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <>
            <nav className="container navbar navbar-expand-md">
                <div className="container-fluid">
                    <span className="fs-3 navbar-brand text-white">Raichlovi</span>
                    <button className="navbar-toggler bg-light text-white" type="button" data-bs-toggle="collapse" data-bs-target="#nav-main" aria-controls="nav-main" aria-expanded="false" aria-label="toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="nav-main">
                        <ul className="navbar text-uppercase fw-bold list-unstyled flex-column flex-md-row align-items-baseline mb-0 me-2 gap-4 ms-auto">
                            <li className="nav-item ms-auto">
                                <NavLink to={"/"} className="nav-link" activeClassName="active" name="home" >
                                    Home
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;