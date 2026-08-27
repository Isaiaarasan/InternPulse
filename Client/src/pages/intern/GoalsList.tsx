import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Filter, Search } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { goalStatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { goalService } from "../../services/goalService";
import { formatDate } from "../../utils/formatDate";

const STATUSES = [
  "All",
  "Pending",
  "In-Progress",
  "Submitted",
  "Approved",
  "Revision-Required",
];

export default function GoalsList() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    goalService
      .getMyGoals()
      .then((res) => {
        const goalsData = res.data.data || res.data;
        setGoals(Array.isArray(goalsData) ? goalsData : []);
      })
      .catch((err) => {
        console.error("Failed to load goals:", err);
        setGoals([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = goals.filter((g) => {
    const matchStatus = filter === "All" || g.status === filter;
    const matchSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primaryText">
            My Goals
          </h2>
          <p className="text-sm text-muted mt-1">{goals.length} goals total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-base pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filter === s
                  ? "bg-primary-500 text-white"
                  : "bg-white dark:bg-gray-800 border border-border dark:border-gray-700 text-muted hover:text-primary-500"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Goals grid */}
      <div className="grid gap-4">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
              />
            ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <Target size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No goals found</p>
            <p className="text-sm mt-1">Try adjusting your filter or search</p>
          </div>
        ) : (
          filtered.map((goal, i) => (
            <motion.div
              key={goal._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/intern/goals/${goal._id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-2xl hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center">
                    <Target size={18} className="text-primary-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base text-primaryText group-hover:text-primary-500 transition-colors truncate sm:whitespace-normal">
                      {goal.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Due {formatDate(goal.deadline)} • {goal.points} pts
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <Badge variant={goalStatusBadge(goal.status)}>
                    {goal.status}
                  </Badge>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
