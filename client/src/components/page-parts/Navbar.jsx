import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
    return (
        <>
            <nav className="navbar navbar-expand-md bg-light navbar-light mb-4">
                <div className="container container-fluid">
                    <span className="fs-3 navbar-brand">čauky</span>
                    <button className="navbar-toggler bg-light text-white" type="button" data-bs-toggle="collapse" data-bs-target="#nav-main" aria-controls="nav-main" aria-expanded="false" aria-label="toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-end" id="nav-main">
                        <ul className="navbar text-uppercase fw-bold list-unstyled flex-column flex-md-row align-items-baseline mb-0 me-2 gap-4 ms-auto">
                            <li className="nav-item ms-auto">
                                <NavLink to={"/"} className="nav-link" name="home" >
                                    Home
                                </NavLink>
                                <NavLink to={"/clenove"} className="nav-link" name="clenove" >
                                    Členové rodiny
                                </NavLink>
                                <NavLink to={"/form"} className="nav-link" name="form" >
                                    Přidat člena    
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