import { useState, useRef, useEffect } from "react";
import { type LucideIcon, ChevronDown } from "lucide-react";

interface AccordionItem {
    icon: LucideIcon;
    label: string;
    content: string[];
}

interface AccordionProps {
    items: AccordionItem[];
}

function AccordionItem({
    item,
    isOpen,
    onToggle,
}: {
    item: AccordionItem;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const bodyRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (bodyRef.current) setHeight(bodyRef.current.scrollHeight);
    }, []);

    const Icon = item.icon;

    return (
        <div className="rounded-xl border overflow-hidden transition-colors duration-200 border-neutral-800 bg-neutral-950/30">
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-3.5 px-4 py-4 text-left"
            >
                <span
                    className="w-8.5 h-8.5 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200"
                >
                    <Icon size={20} stroke="#7c3aed" strokeWidth={2} />
                </span>

                <span className="flex-1 text-[15px] font-medium text-white tracking-tight">
                    {item.label}
                </span>

                <ChevronDown
                    size={20}
                    className="shrink-0 transition-all duration-300"
                    style={{
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                    }}
                />
            </button>

            <div
                className="overflow-hidden transition-all ease-in-out"
                style={{
                    maxHeight: isOpen ? `${height}px` : "0px",
                    opacity: isOpen ? 1 : 0,
                    transition:
                        "max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                }}
            >
                <div ref={bodyRef} className="px-5 pb-4">
                    <ul className="flex flex-col gap-1">
                        {item.content.map((paragraph, j) => (
                            <li
                                key={j}
                                className="flex items-center gap-2 text-sm leading-relaxed text-neutral-400"
                            >
                                <span className="w-1 h-1 rounded-full bg-neutral-400 shrink-0" />
                                {paragraph}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function Accordion({ items }: AccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    return (
        <div className="flex flex-col gap-2.5">
            {items.map((item, i) => (
                <AccordionItem
                    key={i}
                    item={item}
                    isOpen={openIndex === i}
                    onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
            ))}
        </div>
    );
}
