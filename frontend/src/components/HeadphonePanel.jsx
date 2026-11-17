import React from "react";
import { Canvas } from "@react-three/fiber";
import HeadphoneModel from "./HeadphoneModel";
import SyncControls from "./SyncControls";
import "./MinimalContent.css";
import "./FunkyContent.css";

export default function HeadphonePanel({ type, title, modelPath }) {
    const isMinimal = type === "minimal";
    const panelClass = isMinimal ? "minimal-content-panel" : "funky-content-panel";

    return (
        <div className={panelClass}>
            <h1>{title}</h1>
            <div className="headphone-canvas">
                <Canvas camera={{ position: [0, 0, 2.5], fov: 50 }}>
                    <ambientLight intensity={1} />
                    <SyncControls panelId={type} />
                    <HeadphoneModel modelPath={modelPath} isMinimal={isMinimal} />
                </Canvas>
            </div>
        </div>
    );
}
