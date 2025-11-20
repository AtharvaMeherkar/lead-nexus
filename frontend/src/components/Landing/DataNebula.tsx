import { motion } from "framer-motion";

const DataNebula = () => {
  const nodes = Array.from({ length: 18 }).map((_, index) => ({
    delay: index * 0.12,
    size: Math.random() * 40 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {nodes.map((node, idx) => (
        <motion.span
          key={idx}
          className="absolute rounded-full bg-gradient-to-br from-cyan/30 to-magenta/30 blur-3xl"
          style={{ width: node.size, height: node.size, top: `${node.y}%`, left: `${node.x}%` }}
          animate={{ scale: [0.8, 1.2, 0.9], opacity: [0.2, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, delay: node.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

export default DataNebula;


