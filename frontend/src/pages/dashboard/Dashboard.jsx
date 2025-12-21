import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Projects" value="3" />
        <StatCard title="RTL Jobs" value="14" />
        <StatCard title="Lint Issues" value="27" />
      </div>
    </motion.div>
  );
}

function StatCard({ title, value }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-[#020617] border border-gray-800 rounded-xl p-6"
    >
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </motion.div>
  );
}
