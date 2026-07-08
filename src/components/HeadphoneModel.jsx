import React, { useEffect, useState } from "react";
import { useGLTF, Center } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export default function HeadphoneModel({ modelPath, isMinimal }) {
    // useGLTF can load absolute paths served from the public/ folder directly.
    const { scene } = useGLTF(modelPath);
    const [processedModel, setProcessedModel] = useState(null);

    useEffect(() => {
        if (scene) {
            setProcessedModel(scene.clone());
        }
    }, [scene]);

    useFrame(() => {
        // Animation logic if any is needed in the future
    });

    if (!processedModel) {
        return null;
    }

    return (
        <Center>
            <primitive
                object={processedModel}
                scale={3.5}
                rotation={[0, 15, 0]}
            />
        </Center>
    );
}
