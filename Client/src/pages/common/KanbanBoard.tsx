import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { goalStatusBadge } from "../../components/ui/Badge";
import toast from "react-hot-toast";
import { goalService } from "../../services/goalService";

const COLUMNS = [
  { id: "Pending", label: "Pending", color: "bg-warning/10 text-warning" },
  {
    id: "In-Progress",
    label: "In Progress",
    color: "bg-primary-500/10 text-primary-600 dark:text-primary-400",
  },
  {
    id: "Submitted",
    label: "Submitted",
    color: "bg-gray-100 dark:bg-gray-700 text-muted",
  },
  { id: "Approved", label: "Approved", color: "bg-success/10 text-success" },
];

export default function KanbanBoard() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const res = await goalService.getMyGoals();
        const goalsData = res.data.data || res.data;
        const allGoals = Array.isArray(goalsData) ? goalsData : [];
        setGoals(allGoals);
      } catch (err) {
        console.error("Failed to load goals:", err);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const handleDragStart = (id: string) => setDragging(id);

  const handleDrop = (colId: string) => {
    if (!dragging) return;
    const goalToUpdate = goals.find((g) => g._id === dragging);
    if (!goalToUpdate) return;

    setGoals((prev) =>
      prev.map((g) => (g._id === dragging ? { ...g, status: colId } : g)),
    );
    setDragging(null);

    // Update status on backend
    goalService
      .updateGoalStatus(dragging, colId)
      .then(() => toast.success(`Goal moved to ${colId}`))
      .catch((err) => {
        console.error("Failed to update goal:", err);
        toast.error("Failed to move goal");
        // Revert the change
        setGoals((prev) =>
          prev.map((g) => (g._id === dragging ? goalToUpdate : g)),
        );
      });
  };

  return (
    <div className="page-container h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-primaryText">
          Kanban Board
        </h2>
        <p className="text-sm text-muted mt-1">
          Drag and drop goals across stages
        </p>
      </div>

      {loading ? (
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
          {COLUMNS.map((col) => (
            <div
              key={col.id}
              className="min-w-[270px] md:min-w-0 flex-1 snap-start bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 min-h-[380px]"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl"
                  >
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 snap-x snap-mandatory h-full">
          {COLUMNS.map((col) => {
            const colGoals = goals.filter((g) => g.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(col.id)}
                className="min-w-[270px] md:min-w-0 flex-1 snap-start flex flex-col gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-border dark:border-gray-700 min-h-[380px]"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${col.color}`}
                  >
                    {col.label}
                  </span>
                  <span className="text-xs text-muted font-semibold">
                    {colGoals.length}
                  </span>
                </div>
                {colGoals.map((goal, i) => (
                  <motion.div
                    key={goal._id}
                    layout
                    draggable
                    onDragStart={() => handleDragStart(goal._id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-border dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Target
                        size={14}
                        className="text-primary-500 mt-0.5 shrink-0"
                      />
                      <p className="text-sm font-medium text-primaryText leading-snug">
                        {goal.title}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        {goal.points} pts
                      </span>
                      <Badge
                        variant={goalStatusBadge(goal.status)}
                        className="text-[10px]"
                      >
                        {goal.status}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
                {colGoals.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-muted text-center">
                      Drop goals here
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
