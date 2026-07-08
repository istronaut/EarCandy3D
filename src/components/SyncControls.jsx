import React, { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const CONTROLS_SYNC_EVENT = "headphones-controls-sync";

export default function SyncControls({ panelId }) {
    const controlsRef = useRef();
    const { camera } = useThree();
    const isSyncingRef = useRef(false);

    const handleChange = () => {
        if (isSyncingRef.current || !controlsRef.current) return;

        const event = new CustomEvent(CONTROLS_SYNC_EVENT, {
            detail: {
                position: camera.position.toArray(),
                quaternion: camera.quaternion.toArray(),
                target: controlsRef.current.target.toArray(),
                senderId: panelId,
            }
        });
        window.dispatchEvent(event);
    };

    useEffect(() => {
        const handleSync = (e) => {
            if (e.detail.senderId === panelId) return;

            isSyncingRef.current = true;

            // Sync camera position and orientation
            camera.position.fromArray(e.detail.position);
            camera.quaternion.fromArray(e.detail.quaternion);

            // Sync OrbitControls target
            if (controlsRef.current) {
                controlsRef.current.target.fromArray(e.detail.target);
                controlsRef.current.update();
            }

            isSyncingRef.current = false;
        };

        window.addEventListener(CONTROLS_SYNC_EVENT, handleSync);
        return () => {
            window.removeEventListener(CONTROLS_SYNC_EVENT, handleSync);
        };
    }, [camera, panelId]);

    return (
        <OrbitControls
            ref={controlsRef}
            enableZoom={false}
            onChange={handleChange}
        />
    );
}
