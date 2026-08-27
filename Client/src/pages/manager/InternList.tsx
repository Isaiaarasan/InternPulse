import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Search, Plus, Eye } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { userService } from "../../services/userService";

export default function InternList() {
  const [interns, setInterns] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService
      .getInterns()
      .then((r) => {
        const internsData = r.data.data || r.data;
        setInterns(Array.isArray(internsData) ? internsData : []);
      })
      .catch((err) => {
        console.error("Failed to load interns:", err);
        setInterns([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = interns.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.department.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primaryText">
            Intern Directory
          </h2>
          <p className="text-sm text-muted mt-1">
            {interns.length} interns total
          </p>
        </div>
        <Link to="/manager/goals/create">
          <Button>
            <Plus size={16} /> Assign Goal
          </Button>
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          placeholder="Search by name or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {/* Mobile Card List (< md) */}
      <div className="md:hidden space-y-3">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
              />
            ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <Users size={36} className="mx-auto mb-2 opacity-30" />
            <p className="font-medium text-sm">No interns found</p>
          </div>
        ) : (
          filtered.map((intern, i) => (
            <motion.div
              key={intern._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {intern.name?.charAt(0) || "I"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primaryText truncate">
                    {intern.name}
                  </p>
                  <p className="text-xs text-muted truncate">{intern.department || "General"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="success">Active</Badge>
                <Link to={`/manager/interns/${intern._id}`}>
                  <Button variant="ghost" size="sm" className="!p-2">
                    <Eye size={15} />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-2xl border border-border dark:border-gray-700 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border dark:border-gray-700">
              <th className="text-left text-xs font-semibold text-muted uppercase px-6 py-4">
                Intern
              </th>
              <th className="text-left text-xs font-semibold text-muted uppercase px-4 py-4">
                Department
              </th>
              <th className="text-left text-xs font-semibold text-muted uppercase px-4 py-4">
                Goals
              </th>
              <th className="text-left text-xs font-semibold text-muted uppercase px-4 py-4">
                Status
              </th>
              <th className="text-right text-xs font-semibold text-muted uppercase px-6 py-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-gray-700">
            {loading
              ? Array(4)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-4">
                        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
              : filtered.map((intern, i) => (
                  <motion.tr
                    key={intern._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold">
                          {intern.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primaryText">
                            {intern.name}
                          </p>
                          <p className="text-xs text-muted">{intern.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-secondary dark:text-gray-400">
                      {intern.department}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-primaryText">
                      {intern.goalsAssigned || 0}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/manager/interns/${intern._id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye size={14} /> View
                        </Button>
                      </Link>
                    </td>
                  </motion.tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
