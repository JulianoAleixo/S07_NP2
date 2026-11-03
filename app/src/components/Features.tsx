import { motion } from "framer-motion";

const items = [
    { title: "Performance", desc: "Carregamento ultra rápido" },
    { title: "SEO", desc: "Ótimo ranqueamento" },
    { title: "UX", desc: "Experiência fluida" },
];

const Features = () => {
    return (
        <section className="py-20 max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {items.map((item, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className="bg-neutral-800 p-6 rounded-2xl"
                >
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                </motion.div>
            ))}
        </section>
    );
};
export default Features;
