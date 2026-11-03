import { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
    const formRef = useRef<HTMLFormElement>(null);
    const [status, setStatus] = useState<
        "idle" | "loading" | "success" | "error"
    >("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");

        try {
            await emailjs.sendForm(
                import.meta.env.PUBLIC_EMAILJS_SERVICE_ID,
                import.meta.env.PUBLIC_EMAILJS_TEMPLATE_ID,
                formRef.current!,
                { publicKey: import.meta.env.PUBLIC_EMAILJS_PUBLIC_KEY },
            );
            setStatus("success");
            formRef.current?.reset();
        } catch (e) {
            console.error("EmailJS error: ", e);
            setStatus("error");
        }
    };

    return (
        <section
            id="contact"
            className="w-full min-h-[80vh] flex flex-col px-8 sm:px-16 md:px-32 lg:px-48 py-8 md:py-16 gap-8"
        >
            <div className="flex flex-col">
                <h3 className="text-xl text-violet-600">Let's talk</h3>
                <h1 className="text-4xl md:text-5xl font-medium">Contact</h1>
            </div>
            <div className="flex-1 flex flex-col md:flex-row gap-12">
                <div className="flex-1 text-lg text-neutral-500">
                    <p>
                        Have a question or a project in mind? Feel free to reach
                        out.
                    </p>
                    <p>
                        Location:{" "}
                        <span className="text-violet-600">
                            Brazil, Minas Gerais
                        </span>
                    </p>
                </div>

                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex-1 flex flex-col gap-4"
                >
                    <input
                        type="text"
                        name="from_name"
                        placeholder="Name"
                        required
                        className="bg-neutral-800/40 border border-neutral-700 focus:outline-none focus:border-violet-700 px-4 py-2 rounded-lg w-full"
                    />
                    <input
                        type="email"
                        name="from_email"
                        placeholder="Email"
                        required
                        className="bg-neutral-800/40 border border-neutral-700 focus:outline-none focus:border-violet-700 px-4 py-2 rounded-lg w-full"
                    />
                    <textarea
                        name="message"
                        placeholder="Message"
                        required
                        className="bg-neutral-800/40 border border-neutral-700 focus:outline-none focus:border-violet-700 px-4 py-2 rounded-lg w-full flex-1 max-h-52"
                    />

                    {status === "success" && (
                        <p className="text-green-500 text-sm">
                            Message sent successfully!
                        </p>
                    )}
                    {status === "error" && (
                        <p className="text-red-500 text-sm">
                            Something went wrong. Try again.
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={status === "loading"}
                        className="bg-neutral-800/60 hover:bg-neutral-700 border border-neutral-700 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === "loading" ? "Sending..." : "Submit"}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default Contact;
