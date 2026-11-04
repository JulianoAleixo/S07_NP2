import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProjectMockup from "../src/components/ProjectMockup";
import Projects from "../src/components/Projects";
import { projects } from "../src/constants/projects";

describe("ProjectMockup", () => {
    const base = {
        title: "My project",
        status: "Deployed",
        imageUrl: "/assets/image.png",
    };

    it("shows the title, the status and the image", () => {
        render(
            <ProjectMockup {...base} projectUrl={false} repositoryUrl={false} />,
        );

        expect(
            screen.getByRole("heading", { name: "My project" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Deployed")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "My project" })).toHaveAttribute(
            "src",
            "/assets/image.png",
        );
    });

    it("shows both links when the URLs are strings", () => {
        render(
            <ProjectMockup
                {...base}
                projectUrl="https://project.dev"
                repositoryUrl="https://repo.dev"
            />,
        );

        expect(
            screen.getByRole("link", { name: "Go to project" }),
        ).toHaveAttribute("href", "https://project.dev");
        expect(
            screen.getByRole("link", { name: "Go to code repository" }),
        ).toHaveAttribute("href", "https://repo.dev");
    });

    it("hides the project link when its URL is false", () => {
        render(
            <ProjectMockup
                {...base}
                projectUrl={false}
                repositoryUrl="https://repo.dev"
            />,
        );

        expect(
            screen.queryByLabelText("Go to project"),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Go to code repository" }),
        ).toBeInTheDocument();
    });

    it("hides the repository link when its URL is false", () => {
        render(
            <ProjectMockup
                {...base}
                projectUrl="https://project.dev"
                repositoryUrl={false}
            />,
        );

        expect(
            screen.getByRole("link", { name: "Go to project" }),
        ).toBeInTheDocument();
        expect(
            screen.queryByLabelText("Go to code repository"),
        ).not.toBeInTheDocument();
    });

    it("treats an empty URL as missing", () => {
        render(<ProjectMockup {...base} projectUrl="" repositoryUrl="" />);

        expect(screen.queryByLabelText("Go to project")).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText("Go to code repository"),
        ).not.toBeInTheDocument();
    });
});

describe("Projects", () => {
    const cardOf = (title: string) =>
        screen.getByRole("heading", { name: title }).closest<HTMLElement>(
            ".group",
        )!;

    it("identifies the section for the navigation", () => {
        const { container } = render(<Projects />);

        expect(container.querySelector("section")).toHaveAttribute(
            "id",
            "projects",
        );
    });

    it("renders one card for each project", () => {
        render(<Projects />);

        expect(projects.length).toBeGreaterThan(0);
        for (const { title, status } of projects) {
            expect(within(cardOf(title)).getByText(status)).toBeInTheDocument();
        }
    });

    it("gives each card only the links its project has", () => {
        render(<Projects />);

        for (const { title, projectUrl, repositoryUrl } of projects) {
            const links = within(cardOf(title));
            expect(
                links.queryByLabelText("Go to project") !== null,
            ).toBe(Boolean(projectUrl));
            expect(
                links.queryByLabelText("Go to code repository") !== null,
            ).toBe(Boolean(repositoryUrl));
        }
    });

    it("links to the rest of the projects on GitHub in a new tab", () => {
        render(<Projects />);

        const link = screen.getByRole("link", {
            name: "See more projects on Github",
        });

        expect(link).toHaveAttribute("href", "https://github.com/JulianoAleixo");
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
});
