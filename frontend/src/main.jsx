import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import Header from "./components/layout/Header/Header";

const basename = window.location.pathname.startsWith("/EarCandy3D") ? "/EarCandy3D" : "/";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter basename={basename}>
            <Header />
            <App />
        </BrowserRouter>
    </StrictMode>
);
