import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import emailjs from "@emailjs/browser";
import Contact from "../src/components/Contact";

// O EmailJS é sempre falso: este teste nunca envia e-mail real.
vi.mock("@emailjs/browser", () => ({
    default: { sendForm: vi.fn() },
}));

const sendForm = vi.mocked(emailjs.sendForm);

describe("Contact", () => {
    const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
        await user.type(screen.getByPlaceholderText("Name"), "Ana");
        await user.type(screen.getByPlaceholderText("Email"), "ana@test.dev");
        await user.type(screen.getByPlaceholderText("Message"), "Hello");
    };

    const submit = () => screen.getByRole("button");

    beforeEach(() => {
        sendForm.mockReset();
        vi.stubEnv("PUBLIC_EMAILJS_SERVICE_ID", "service-id");
        vi.stubEnv("PUBLIC_EMAILJS_TEMPLATE_ID", "template-id");
        vi.stubEnv("PUBLIC_EMAILJS_PUBLIC_KEY", "public-key");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.restoreAllMocks();
    });

    it("shows the section content and the location", () => {
        render(<Contact />);

        expect(
            screen.getByRole("heading", { name: "Contact" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Brazil, Minas Gerais")).toBeInTheDocument();
        expect(submit()).toHaveTextContent("Submit");
    });

    it("sends the form with the variables from the environment", async () => {
        const user = userEvent.setup();
        sendForm.mockResolvedValue({ status: 200, text: "OK" });
        const { container } = render(<Contact />);

        await fillForm(user);
        await user.click(submit());

        expect(sendForm).toHaveBeenCalledTimes(1);
        expect(sendForm).toHaveBeenCalledWith(
            "service-id",
            "template-id",
            container.querySelector("form"),
            { publicKey: "public-key" },
        );
    });

    it("shows success and clears the form after sending", async () => {
        const user = userEvent.setup();
        sendForm.mockResolvedValue({ status: 200, text: "OK" });
        render(<Contact />);

        await fillForm(user);
        await user.click(submit());

        expect(
            await screen.findByText("Message sent successfully!"),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Name")).toHaveValue("");
        expect(screen.getByPlaceholderText("Email")).toHaveValue("");
        expect(screen.getByPlaceholderText("Message")).toHaveValue("");
        expect(submit()).toBeEnabled();
    });

    it("shows an error and keeps the typed data when sending fails", async () => {
        const user = userEvent.setup();
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        sendForm.mockRejectedValue(new Error("network"));
        render(<Contact />);

        await fillForm(user);
        await user.click(submit());

        expect(
            await screen.findByText("Something went wrong. Try again."),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Name")).toHaveValue("Ana");
        expect(
            screen.queryByText("Message sent successfully!"),
        ).not.toBeInTheDocument();
        expect(consoleError).toHaveBeenCalled();
    });

    it("shows Sending... and disables the button during the request", async () => {
        const user = userEvent.setup();
        let finish!: (value: { status: number; text: string }) => void;
        sendForm.mockReturnValue(
            new Promise((resolve) => {
                finish = resolve;
            }),
        );
        render(<Contact />);

        await fillForm(user);
        await user.click(submit());

        expect(submit()).toHaveTextContent("Sending...");
        expect(submit()).toBeDisabled();

        finish({ status: 200, text: "OK" });

        await waitFor(() => expect(submit()).toHaveTextContent("Submit"));
        expect(submit()).toBeEnabled();
    });

    it("does not send when required fields are empty", async () => {
        const user = userEvent.setup();
        render(<Contact />);

        await user.click(submit());

        expect(sendForm).not.toHaveBeenCalled();
        expect(submit()).toHaveTextContent("Submit");
    });
});
