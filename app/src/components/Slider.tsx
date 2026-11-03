interface SliderItem {
    image: string;
    alt?: string;
    text?: string;
}

interface SliderProps {
    items: SliderItem[];
    duration?: number;
    className?: string;
}

const Slider: React.FC<SliderProps> = ({
    items,
    duration = 25,
    className = "",
}) => {
    const doubled = [...items, ...items];

    return (
        <div
            className={`group overflow-hidden w-full [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)]mask-[linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] ${className}`}
        >
            <div
                className="flex w-max animate-[slide_var(--duration)_linear_infinite] hover:[animation-play-state:paused]"
                style={{ "--duration": `${duration}s` } as React.CSSProperties}
            >
                {doubled.map((item, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 px-7 whitespace-nowrap transition-all duration-300 group-hover:opacity-40 group-hover:grayscale hover:opacity-100! hover:grayscale-0!"
                    >
                        <img
                            src={item.image}
                            alt={item.alt ?? item.text ?? ""}
                            width={54}
                            height={54}
                            loading="eager"
                            decoding="async"
                            className="object-contain"
                        />
                        {item.text && (
                            <span className="text-sm font-semibold">
                                {item.text}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Slider;