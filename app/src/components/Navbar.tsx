import { useEffect, useState } from "react";
import {
    motion,
    useScroll,
    useTransform,
    useMotionValueEvent,
    type MotionValue,
} from "framer-motion";
import { Folder, Home, MousePointer2 } from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    sectionId: string;
    icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "Home",
        href: "#home",
        sectionId: "home",
        icon: <Home />,
    },
    {
        label: "Projects",
        href: "#projects",
        sectionId: "projects",
        icon: <Folder />,
    },
    {
        label: "Contact",
        href: "#contact",
        sectionId: "contact",
        icon: <MousePointer2 />,
    },
];

const SHRINK_THRESHOLD = 240;
const PILL_WIDTH = 460;

function useShrinkProgress(scrollY: MotionValue<number>) {
    return useTransform(scrollY, [0, SHRINK_THRESHOLD], [0, 1], {
        clamp: true,
    });
}

const MobileDock = ({
    activeSection,
    onNavClick,
}: {
    activeSection: string;
    onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) => {
    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-0 md:hidden pointer-events-none"
        >
            <nav className="pointer-events-auto w-full flex items-center justify-around px-6 py-3 pt-4 bg-[rgba(9,11,12,0.72)] backdrop-blur-[20px] border-t border-[rgba(255,255,255,0.07)] rounded-tl-2xl rounded-tr-2xl">
                {NAV_ITEMS.map(({ label, href, sectionId, icon }) => {
                    const isActive = activeSection === sectionId;
                    return (
                        <a
                            key={sectionId}
                            href={href}
                            onClick={(e) => onNavClick(e, href)}
                            className="flex flex-col items-center gap-1 select-none transition-colors duration-200"
                        >
                            <motion.div
                                animate={{ scale: isActive ? 1.15 : 1 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="relative flex items-center justify-center"
                            >
                                <span className="relative z-10">{icon}</span>
                            </motion.div>
                            <motion.span
                                animate={{ opacity: isActive ? 1 : 0.5 }}
                                className="text-[10px] font-medium tracking-wide"
                            >
                                {label}
                            </motion.span>
                            <motion.div
                                animate={{
                                    opacity: isActive ? 1 : 0,
                                    scale: isActive ? 1 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                                className="w-1 h-1 rounded-full bg-green-400"
                            />
                        </a>
                    );
                })}
            </nav>
        </motion.div>
    );
};

const DesktopNavbar = ({
    activeSection,
    onNavClick,
}: {
    activeSection: string;
    onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [viewportWidth, setViewportWidth] = useState(
        typeof window !== "undefined" ? window.innerWidth : 1440,
    );

    const { scrollY } = useScroll();
    const progress = useShrinkProgress(scrollY);

    useEffect(() => {
        const handleResize = () => setViewportWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navWidth = useTransform(
        progress,
        [0, 1],
        [viewportWidth, PILL_WIDTH],
    );
    const borderRadius = useTransform(progress, [0, 1], [0, 9999]);
    const marginTop = useTransform(progress, [0, 1], ["0px", "8px"]);
    const paddingY = useTransform(progress, [0, 1], ["16px", "8px"]);
    const backgroundColor = useTransform(
        progress,
        [0, 1],
        ["rgba(9,11,12,0)", "rgba(9,11,12,0.72)"],
    );
    const borderColor = useTransform(
        progress,
        [0, 1],
        ["rgba(255,255,255,0)", "rgba(255,255,255,0.07)"],
    );
    const boxShadow = useTransform(
        progress,
        [0, 1],
        ["0 0px 0px rgba(0,0,0,0)", "0 4px 32px rgba(0,0,0,0.40)"],
    );

    useMotionValueEvent(scrollY, "change", (v) => {
        setIsScrolled(v > SHRINK_THRESHOLD * 0.1);
    });

    return (
        <div className="fixed top-0 left-0 right-0 z-50 justify-center pointer-events-none hidden md:flex">
            <motion.nav
                style={{
                    width: navWidth,
                    borderRadius,
                    backgroundColor,
                    borderColor,
                    boxShadow,
                    marginTop,
                    paddingTop: paddingY,
                    paddingBottom: paddingY,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    backdropFilter: isScrolled ? "blur(14px)" : "none",
                    WebkitBackdropFilter: isScrolled ? "blur(14px)" : "none",
                }}
                className="pointer-events-auto py-3 px-8 flex items-center justify-center gap-10 transition-[backdrop-filter] duration-300"
            >
                {NAV_ITEMS.map(({ label, href, sectionId }) => {
                    const isActive = activeSection === sectionId;
                    return (
                        <a
                            key={sectionId}
                            href={href}
                            onClick={(e) => onNavClick(e, href)}
                            className={`flex items-center gap-2 text-lg font-medium transition-colors duration-200 select-none hover:text-white ${
                                isActive
                                    ? "text-white"
                                    : "text-neutral-400 text-shadow-2xs text-shadow-black"
                            }`}
                        >
                            <motion.span
                                animate={{
                                    opacity: isActive ? 1 : 0,
                                    scale: isActive ? 1 : 0.3,
                                }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0"
                            />
                            {label}
                        </a>
                    );
                })}
            </motion.nav>
        </div>
    );
};

const Navbar = () => {
    const [activeSection, setActiveSection] = useState(NAV_ITEMS[0].sectionId);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        NAV_ITEMS.forEach(({ sectionId }) => {
            const el = document.getElementById(sectionId);
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(sectionId);
                },
                { threshold: 0.4 },
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach((o) => o.disconnect());
    }, []);

    const handleNavClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        e.preventDefault();
        document
            .getElementById(href.replace("#", ""))
            ?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <>
            <DesktopNavbar
                activeSection={activeSection}
                onNavClick={handleNavClick}
            />
            <MobileDock
                activeSection={activeSection}
                onNavClick={handleNavClick}
            />
        </>
    );
};

export default Navbar;
