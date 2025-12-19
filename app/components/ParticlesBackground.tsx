"use client";

export function ParticlesBackground() {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        delay: `${Math.random() * 6}s`,
        size: `${Math.random() * 4 + 2}px`,
    }));

    return (
        <div className="particles">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        top: p.top,
                        animationDelay: p.delay,
                        width: p.size,
                        height: p.size,
                    }}
                />
            ))}
        </div>
    );
}
