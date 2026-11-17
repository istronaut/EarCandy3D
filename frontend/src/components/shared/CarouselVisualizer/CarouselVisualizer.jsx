import { useEffect, useRef } from "react";
import "./CarouselVisualizer.css";

export default function CarouselVisualizer() {
    const canvasRef = useRef(null);
    const glRef = useRef(null);
    const programRef = useRef(null);
    const positionBufferRef = useRef(null);
    const texCoordBufferRef = useRef(null);
    const animationRef = useRef(null);
    const timeRef = useRef(0);
    const lastTimeRef = useRef(performance.now());

    const mouseTargetRef = useRef({ x: 0.5, y: 0.5 });
    const mouseCurrentRef = useRef({ x: 0.5, y: 0.5 });

    // Vertex shader
    const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_texCoord;
        }
    `;

    // Fragment shader with 10 derivative-corrected anti-aliased neon sine waves
    const fragmentShaderSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform float u_mouseX; // Normalized X (0 to 1)
        uniform float u_mouseY; // Normalized Y (0 to 1)
        uniform vec2 u_resolution;

        // Render line with derivative-corrected distance & crisp anti-aliasing
        void getWaveLine(
            vec2 uv, float aspect, float currentAmplitude, float frequency, float speed, float u_time,
            float offset, float fMult, float sMult, float phase, float aMult, vec3 color,
            float mouseXPulse, float mouseYStrength, float u_mouseX,
            inout vec3 finalColor
        ) {
            float freq = frequency * fMult;
            float spd = speed * sMult;
            float amp = currentAmplitude * aMult;

            // Mouse disruption: subtle ripple turbulence right under cursor
            float mouseDisrupt = mouseXPulse * mouseYStrength * sin((uv.x - u_mouseX) * 45.0 - u_time * 6.0) * 0.18;
            float theta = uv.x * freq + u_time * spd + phase + mouseDisrupt;

            // Subtle localized bump distortion from mouse
            float mouseBump = mouseXPulse * mouseYStrength * 0.03 * aMult * cos((uv.x - u_mouseX) * 30.0);
            float waveVal = sin(theta) * amp + mouseBump;

            float waveDeriv = cos(theta) * (freq + mouseXPulse * 6.0) * amp;

            float dy = uv.y - offset - waveVal;
            // Slope and aspect-ratio corrected perpendicular distance
            float dist = abs(dy) / sqrt(1.0 + waveDeriv * waveDeriv * aspect * aspect);

            float pxSize = 1.0 / u_resolution.y;
            float coreRadius = pxSize * 1.1;
            float aaWidth = pxSize * 1.2;

            // Crisp anti-aliased core line
            float core = 1.0 - smoothstep(coreRadius - aaWidth, coreRadius + aaWidth, dist);
            // Tight, subtle glow (drastically reduced haziness)
            float glowRadius = pxSize * 6.0;
            float glow = exp(-pow(dist / glowRadius, 2.0));

            finalColor += color * (glow * 0.22 + core * 1.6);
        }

        void main() {
            vec2 uv = v_texCoord;
            float aspect = u_resolution.x / u_resolution.y;

            // --- Amplitude Control based on Mouse and Screen Center ---
            float baseAmplitude = 0.008;

            // Influence based on X-axis distance from screen center
            float xCenterInfluence = 1.0 - smoothstep(0.0, 0.5, abs(uv.x - 0.5));
            xCenterInfluence = pow(xCenterInfluence, 2.5);

            // Tightly scoped mouse disruption pulse (narrow horizontal width)
            float mouseXPulse = exp(-pow(uv.x - u_mouseX, 2.0) * 160.0);

            // Mouse Y-position strength (gentle dynamic range)
            float mouseYStrength = (1.0 - u_mouseY) * 0.5 + 0.4;

            float amplitudeFromCenter = baseAmplitude + xCenterInfluence * 0.25;
            float mouseAmplitude = mouseXPulse * mouseYStrength * 0.10;

            float currentAmplitude = clamp(amplitudeFromCenter + mouseAmplitude, 0.005, 0.45);

            float frequency = 10.0;
            float speed = 2.0;

            vec3 finalColor = vec3(0.0);

            // 10 multi-layered neon waves with subtle mouse disruption
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.50, 1.00, 1.00,  0.0, 1.0, vec3(0.0, 1.0, 1.0), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.49, 1.05, 0.95,  0.5, 0.9, vec3(1.0, 0.0, 1.0), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.51, 0.95, 1.05, -0.3, 0.8, vec3(0.0, 1.0, 0.5), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.48, 1.10, 0.90,  1.0, 0.7, vec3(1.0, 0.5, 0.0), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.52, 0.90, 1.10, -1.0, 0.6, vec3(0.6, 0.1, 1.0), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.47, 1.15, 0.85,  0.2, 0.5, vec3(1.0, 0.2, 0.6), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.53, 0.85, 1.15, -0.7, 0.4, vec3(0.1, 0.6, 1.0), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.46, 1.20, 0.80,  0.8, 0.3, vec3(1.0, 0.9, 0.2), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.54, 0.80, 1.20, -0.1, 0.2, vec3(0.2, 1.0, 0.6), mouseXPulse, mouseYStrength, u_mouseX, finalColor);
            getWaveLine(uv, aspect, currentAmplitude, frequency, speed, u_time, 0.45, 1.25, 0.75,  0.6, 0.1, vec3(0.5, 1.0, 0.1), mouseXPulse, mouseYStrength, u_mouseX, finalColor);

            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const createShader = (gl, type, source) => {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(
                "Shader compilation error:",
                gl.getShaderInfoLog(shader)
            );
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    };

    const createProgram = (gl, vertexShader, fragmentShader) => {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(
                "Program linking error:",
                gl.getProgramInfoLog(program)
            );
            gl.deleteProgram(program);
            return null;
        }
        return program;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl =
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");

        if (!gl) {
            console.error("WebGL not supported");
            return;
        }

        glRef.current = gl;

        // Set canvas size
        const resizeCanvas = () => {
            if (!canvas || !gl) return;
            const rect = canvas.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Create shaders
        const vertexShader = createShader(
            gl,
            gl.VERTEX_SHADER,
            vertexShaderSource
        );
        const fragmentShader = createShader(
            gl,
            gl.FRAGMENT_SHADER,
            fragmentShaderSource
        );

        if (!vertexShader || !fragmentShader) return;

        // Create program
        const program = createProgram(gl, vertexShader, fragmentShader);
        if (!program) return;

        programRef.current = program;
        gl.useProgram(program);

        // Create full-screen quad
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

        // Create buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        positionBufferRef.current = positionBuffer;

        const texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
        texCoordBufferRef.current = texCoordBuffer;

        // Set up attributes
        const positionLocation = gl.getAttribLocation(program, "a_position");
        const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        // Get uniform locations
        const timeLocation = gl.getUniformLocation(program, "u_time");
        const mouseXLocation = gl.getUniformLocation(program, "u_mouseX");
        const mouseYLocation = gl.getUniformLocation(program, "u_mouseY");
        const resolutionLocation = gl.getUniformLocation(
            program,
            "u_resolution"
        );

        // Continuous exact modulo period for floating point time stability
        const TIME_PERIOD = Math.PI * 200.0;
        lastTimeRef.current = performance.now();

        // Animation loop
        const render = () => {
            const now = performance.now();
            const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
            lastTimeRef.current = now;

            timeRef.current = (timeRef.current + dt) % TIME_PERIOD;

            // Smooth mouse position linear interpolation (lerp)
            mouseCurrentRef.current.x +=
                (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.08;
            mouseCurrentRef.current.y +=
                (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.08;

            if (glRef.current && programRef.current && canvasRef.current) {
                gl.uniform1f(timeLocation, timeRef.current);
                gl.uniform1f(mouseXLocation, mouseCurrentRef.current.x);
                gl.uniform1f(mouseYLocation, mouseCurrentRef.current.y);
                gl.uniform2f(
                    resolutionLocation,
                    canvasRef.current.width,
                    canvasRef.current.height
                );

                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            animationRef.current = requestAnimationFrame(render);
        };

        render();

        const handleMouseMove = (e) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            mouseTargetRef.current = {
                x: Math.max(0, Math.min(1, x)),
                y: Math.max(0, Math.min(1, y)),
            };
        };

        const handleMouseLeave = () => {
            mouseTargetRef.current = { x: 0.5, y: 0.5 };
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseleave", handleMouseLeave);

            // Cleanup WebGL context resources
            if (glRef.current) {
                const glCtx = glRef.current;
                if (programRef.current) {
                    glCtx.deleteProgram(programRef.current);
                    programRef.current = null;
                }
                if (positionBufferRef.current) {
                    glCtx.deleteBuffer(positionBufferRef.current);
                    positionBufferRef.current = null;
                }
                if (texCoordBufferRef.current) {
                    glCtx.deleteBuffer(texCoordBufferRef.current);
                    texCoordBufferRef.current = null;
                }
                glRef.current = null;
            }
        };
    }, []);

    return (
        <div className="carousel-visualizer">
            <canvas ref={canvasRef} className="webgl-canvas" />
        </div>
    );
}

