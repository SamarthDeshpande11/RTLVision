import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../utils/axios";
import SimulationTimeline from "../components/SimulationTimeline";
import LogConsole from "../components/LogConsole";

export default function RTLJobDetails() {
  const { projectId, jobId } = useParams();
  const [job, setJob] = useState(null);

  useEffect(() => {
    const interval = setInterval(fetchJob, 2000);
    fetchJob();
    return () => clearInterval(interval);
  }, []);

  async function fetchJob() {
    const res = await axios.get(
      `/api/rtl-jobs/${projectId}/jobs/${jobId}`
    );
    setJob(res.data.data);
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{job.jobName}</h1>
        <StatusBadge status={job.status} />
      </header>

      <SimulationTimeline status={job.status} />

      <LogConsole logs={job.logs} />
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    queued: "bg-gray-600",
    running: "bg-blue-600",
    success: "bg-green-600",
    failed: "bg-red-600",
  };

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm ${colors[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
