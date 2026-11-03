import { lazy, Suspense } from "react";
import { techItems } from "../constants/techItems";
import Github from "../icons/Github";
import Gmail from "../icons/Gmail";
import Linkedin from "../icons/Linkedin";
import Slider from "./Slider";
import SocialButton from "./SocialButton";

const Silk = lazy(() => import("./Silk"));

const Hero = () => {
    return (
        <section
            id="home"
            className="relative w-full min-h-screen flex items-center justify-center text-center"
        >
            {/* Background */}
            <div className="absolute inset-0">
                <Suspense fallback={null}>
                    <Silk
                        speed={5}
                        scale={1}
                        color="#7B7481"
                        noiseIntensity={1.5}
                        rotation={0}
                    />
                </Suspense>
            </div>

            <div className="relative w-full min-h-screen flex flex-col overflow-hidden px-8 sm:px-16 md:px-32 lg:px-48 pb-32 md:py-16">
                <div className="relative z-10 flex-1 flex items-center">
                    <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-8 md:gap-16">
                        <div className="flex flex-col gap-6">
                            <p className="text-white/70 tracking-widest font-medium text-lg sm:text-xl lg:text-2xl text-left">
                                Hi, I'm Juliano Aleixo
                            </p>

                            <h1 className="text-5xl sm:text-7xl lg:text-7xl xl:text-8xl font-medium text-white leading-[1.05] tracking-tight text-left">
                                Software
                                <br />
                                Engineer
                            </h1>

                            <div className="flex items-center gap-3 mt-2">
                                <SocialButton
                                    href="https://www.linkedin.com/in/dev-juliano-aleixo/"
                                    className="h-16 w-16"
                                >
                                    <Linkedin className="size-8" />
                                </SocialButton>
                                <SocialButton
                                    href="https://github.com/JulianoAleixo"
                                    className="h-16 w-16"
                                >
                                    <Github className="size-8" />
                                </SocialButton>
                                <SocialButton
                                    href="https://mail.google.com/mail/?view=cm&fs=1&to=juliano.aleixo@gmail.com"
                                    className="h-16 w-16"
                                >
                                    <Gmail className="size-8" />
                                </SocialButton>
                            </div>
                        </div>

                        <div className="flex flex-1 items-center lg:justify-end">
                            <p className="text-white/60 text-lg sm:text-xl lg:text-2xl xl:text-3xl leading-relaxed font-light text-right">
                                Transforming ideas into interactive and seamless
                                digital experiences with cutting-edge{" "}
                                <span className="text-violet-400 font-normal">
                                    full-stack development
                                </span>
                                .
                            </p>
                        </div>
                    </div>
                </div>

                <Slider items={techItems} duration={30} />
            </div>
        </section>
    );
};

export default Hero;
