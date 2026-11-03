import { CodeXml, ExternalLink } from "lucide-react";
import SocialButton from "./SocialButton";

const ProjectMockup = ({
    title,
    status,
    projectUrl,
    repositoryUrl,
    imageUrl,
}: {
    title: string;
    status: string;
    projectUrl: string | boolean;
    repositoryUrl: string | boolean;
    imageUrl: string;
}) => {
    return (
        <div className="group">
            <div className="bg-stone-700 rounded-xl overflow-hidden p-8">
                <img
                    src={imageUrl}
                    alt={title}
                    loading="lazy"
                    className="rounded-xl w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                />
            </div>
            <div className="py-6 px-4 flex flex-row gap-2">
                <div className="flex-1">
                    <h4 className="text-xl font-semibold text-white">
                        {title}
                    </h4>
                    <p className="text-md font-medium text-neutral-500">
                        {status}
                    </p>
                </div>
                <div className="flex flex-row gap-4">
                    {projectUrl && typeof projectUrl === "string" && (
                        <SocialButton
                            href={projectUrl}
                            ariaLabel="Go to project"
                        >
                            <ExternalLink />
                        </SocialButton>
                    )}
                    {repositoryUrl && typeof repositoryUrl === "string" && (
                        <SocialButton
                            href={repositoryUrl}
                            ariaLabel="Go to code repository"
                        >
                            <CodeXml />
                        </SocialButton>
                    )}
                </div>
            </div>
        </div>
    );
};
export default ProjectMockup;
