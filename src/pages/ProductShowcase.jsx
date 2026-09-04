import { useState, useCallback } from "react";
import "./ProductShowcase.css";
import VerticalProductCard from "../components/shared/VerticalProductCard/VerticalProductCard";
import CarouselVisualizer from "../components/shared/CarouselVisualizer/CarouselVisualizer";
import templateImg from "/template_img.webp";

export default function ProductShowcase() {
    const products = [
        {
            name: "Audiomaster Alpha",
            image: templateImg,
            description: "High-quality sound with a sleek design.",
            price: 129.99,
        },
        {
            name: "BassBeast X",
            image: templateImg,
            description: "Deep bass and crystal clarity.",
            price: 159.99,
        },
        {
            name: "CrystalSound Pro",
            image: templateImg,
            description: "True wireless experience.",
            price: 199.99,
        },
        {
            name: "EchoBuds 2",
            image: templateImg,
            description: "Alexa built-in, all-day battery.",
            price: 89.99,
        },
        {
            name: "StudioMaster Elite",
            image: templateImg,
            description: "Audiophile-grade clarity for studio use.",
            price: 249.99,
        },
    ];

    const count = products.length;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const navigate = useCallback(
        (direction) => {
            if (isAnimating) return;
            setIsAnimating(true);
            setActiveIndex((prev) => (prev + direction + count) % count);
            setTimeout(() => setIsAnimating(false), 420);
        },
        [isAnimating, count]
    );

    // Compute the visual slot offset for each card relative to active.
    // Returns continuous offsets like -2 (far left), -1 (left peek), 0 (centre), 1 (right peek), 2 (far right).
    const getSlot = (index) => {
        let diff = index - activeIndex;
        const half = Math.floor(count / 2);
        while (diff > half) diff -= count;
        while (diff < -half) diff += count;
        return diff;
    };

    return (
        <div className="product-showcase">
            <div className="visualizer-container">
                <CarouselVisualizer />
            </div>

            {/* Left arrow */}
            <button
                className="carousel-arrow carousel-arrow--left"
                onClick={() => navigate(1)}
                aria-label="Previous product"
            >
                &#8249;
            </button>

            {/* Cards */}
            <div className="carousel-stage" aria-live="polite">
                {products.map((product, index) => {
                    const slot = getSlot(index);

                    return (
                        <div
                            key={index}
                            className="carousel-item"
                            data-slot={slot}
                            onClick={() => slot !== 0 && navigate(slot > 0 ? -1 : 1)}
                            aria-hidden={slot !== 0}
                        >
                            <VerticalProductCard product={product} />
                        </div>
                    );
                })}
            </div>

            {/* Right arrow */}
            <button
                className="carousel-arrow carousel-arrow--right"
                onClick={() => navigate(-1)}
                aria-label="Next product"
            >
                &#8250;
            </button>

            {/* Dot indicators */}
            <div className="carousel-dots" role="tablist">
                {products.map((_, index) => (
                    <button
                        key={index}
                        role="tab"
                        aria-selected={index === activeIndex}
                        className={`carousel-dot${index === activeIndex ? " carousel-dot--active" : ""}`}
                        onClick={() => {
                            if (!isAnimating) {
                                setActiveIndex(index);
                            }
                        }}
                        aria-label={`Go to product ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
