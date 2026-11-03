import { Heart } from "lucide-react";
import Github from "../icons/Github";
import Gmail from "../icons/Gmail";
import Linkedin from "../icons/Linkedin";
import Divider from "./Divider";
import SocialButton from "./SocialButton";
import TechStack from "./TechStack";
import LikeButton from "./LikeButton";

const Footer = () => {
    return (
        <footer className="flex flex-col p-4 mx-12">
            <div className="flex flex-col md:flex-row justify-around items-center gap-8">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row justify-center align-center gap-4">
                        <SocialButton
                            href="https://www.linkedin.com/in/dev-juliano-aleixo/"
                            className="h-8 w-8 bg-transparent! border-none!"
                        >
                            <Linkedin className="size-8" />
                        </SocialButton>
                        <SocialButton
                            href="https://github.com/JulianoAleixo"
                            className="h-8 w-8 bg-transparent! border-none!"
                        >
                            <Github className="size-8" />
                        </SocialButton>
                        <SocialButton
                            href="https://mail.google.com/mail/?view=cm&fs=1&to=juliano.aleixo@gmail.com"
                            className="h-8 w-8 bg-transparent! border-none!"
                        >
                            <Gmail className="size-8" />
                        </SocialButton>
                    </div>

                    <LikeButton />
                </div>
                <TechStack />
            </div>

            <Divider />

            <div className="text-center text-gray-500">
                Copyright © {new Date().getFullYear()} Juliano Aleixo. All
                rights reserved.
            </div>
        </footer>
    );
};
export default Footer;
