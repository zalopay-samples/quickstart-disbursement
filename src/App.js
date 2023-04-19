import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { PayrollRequestContainer } from "./features/request/PayrollRequest";
import { ConfirmContainer } from "./features/confirm/Confirm";
import { StatusContainer } from "./features/status/Status";
import "./App.css";

const App = () => (
  <>
    <header id="header">
      <Link to="/">
        <img className="logo" src="/images/disbursify-logo.svg" alt="" />
      </Link>
    </header>
    <div className="container">
      <Routes>
        <Route path="/" element={<PayrollRequestContainer />} />
        <Route path="/confirm" element={<ConfirmContainer/>} />
        <Route path="/status/:type" element={<StatusContainer />} />
      </Routes>
    </div>
  </>
);

export default App;
