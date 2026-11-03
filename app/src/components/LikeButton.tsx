import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";
import { fetchLikes, sendLike } from "../lib/likesApi";

const getDeviceId = (): string => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("deviceId", id);
    }
    return id;
};

const LikeButton = () => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState<number | null>(null);
    const [pop, setPop] = useState(false);
    const [loading, setLoading] = useState(true);

    const controls = useAnimation();
    const ref = useRef<HTMLButtonElement>(null);
    const inView = useInView(ref, { margin: "0px 0px -60px 0px" });

    useEffect(() => {
        const init = async () => {
            try {
                const data = await fetchLikes(getDeviceId());
                setCount(data.count);
                setLiked(data.liked);
            } catch {
                setCount(0);
            }
            setLoading(false);
        };

        init();
    }, []);

    useEffect(() => {
        if (inView && !loading && !liked) {
            const timer = setTimeout(async () => {
                await controls.start({
                    boxShadow: [
                        "0 0 0px #7C3AED00",
                        "0 0 14px #7C3AED99",
                        "0 0 0px #7C3AED00",
                    ],
                    transition: { duration: 1, ease: "easeInOut" },
                });
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [inView, loading, liked]);

    const handleClick = async () => {
        if (liked || loading) return;

        const deviceId = getDeviceId();

        setLiked(true);
        setCount((prev) => (prev ?? 0) + 1);
        setPop(true);
        setTimeout(() => setPop(false), 280);

        try {
            const data = await sendLike(deviceId);
            setCount(data.count);
        } catch {
            setLiked(false);
            setCount((prev) => Math.max((prev ?? 1) - 1, 0));
        }
    };

    return (
        <motion.button
            ref={ref}
            animate={controls}
            onClick={handleClick}
            disabled={liked || loading}
            whileTap={!liked && !loading ? { scale: 0.93 } : {}}
            className={`
                inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-full
                border border-violet-600 bg-transparent
                text-sm font-medium select-none
                transition-colors duration-150
                ${!liked && !loading ? "cursor-pointer hover:bg-violet-600/10" : "cursor-default"}
                ${liked ? "bg-violet-600/10" : ""}
            `}
        >
            <Heart
                size={20}
                stroke="#7C3AED"
                fill={liked ? "#7C3AED" : "none"}
                className={pop ? "animate-pop" : ""}
            />
            {count === null ? "0 Likes" : `${count.toLocaleString()} Likes`}
        </motion.button>
    );
};

export default LikeButton;
