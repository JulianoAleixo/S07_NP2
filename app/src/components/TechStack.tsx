import Astro from "../icons/Astro";
import Tailwind from "../icons/Tailwind";
import Vercel from "../icons/Vercel";

const stack = [
    { label: "Built with", name: "Astro", icon: <Astro className="size-5" /> },
    {
        label: "Styled with",
        name: "TailwindCSS",
        icon: <Tailwind className="size-5" />,
    },
    {
        label: "Deployed on",
        name: "Vercel",
        icon: <Vercel className="size-5" />,
    },
];

const TechStack = () => (
    <div className="flex flex-col gap-2">
        {stack.map(({ label, name, icon }) => (
            <div
                key={name}
                className="flex items-center gap-2 text-sm text-neutral-400"
            >
                <span>{label}</span>
                <span>{icon}</span>
                <span className="font-medium">{name}</span>
            </div>
        ))}
    </div>
);

export default TechStack;
