import { motion } from "framer-motion";
import Github from "../icons/Github";
import { projects } from "../constants/projects";
import ProjectMockup from "./ProjectMockup";

const Projects = () => {
    return (
        <section
            id="projects"
            className="w-full min-h-screen flex flex-col px-8 sm:px-16 md:px-32 lg:px-48 py-8 md:py-16 gap-8"
        >
            <div className="flex flex-col">
                <h3 className="text-xl text-violet-600">My work</h3>
                <h1 className="text-4xl md:text-5xl font-medium">Projects</h1>
            </div>
            <div className="flex-1 flex flex-col">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-80px" }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <ProjectMockup
                                title={project.title}
                                projectUrl={project.projectUrl}
                                repositoryUrl={project.repositoryUrl}
                                imageUrl={project.imageUrl}
                                status={project.status}
                            />
                        </motion.div>
                    ))}
                </div>
                <a
                    href="https://github.com/JulianoAleixo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-neutral-800 bg-neutral-950/30 hover:bg-neutral-950/50 transition-colors w-full py-3 text-center text-white rounded-xl mt-8 inline-flex items-center justify-center gap-2"
                >
                    See more projects on <Github />
                </a>
            </div>
        </section>
    );
};
export default Projects;
