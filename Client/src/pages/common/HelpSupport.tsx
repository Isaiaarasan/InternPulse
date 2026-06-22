import { useState, useEffect } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageSquare,
  Send,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { useAuthStore } from "../../stores/authStore";
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const faqs = [
  {
    q: "How do I submit my weekly report?",
    a: 'Go to "Submit Report" in the sidebar, select your active goal, write your report using the rich text editor, and click Submit.',
  },
  {
    q: "How is my score calculated?",
    a: "Your score is based on 40% goal completion, 40% approved reports, and 20% average manager feedback score.",
  },
  {
    q: "Can I edit a submitted report?",
    a: "Once submitted, reports cannot be edited. If revision is requested by your manager, you can resubmit.",
  },
  {
    q: "How does the leaderboard work?",
    a: "Points are awarded: 10 pts per completed goal, 10 pts per approved report, 5 pts bonus for on-time submission.",
  },
  {
    q: "When will I get feedback on my report?",
    a: "Managers typically review reports within 2–3 business days. You will get a notification when reviewed.",
  },
];

const statusColors = {
  open: "bg-warning/10 text-warning",
  "in-progress": "bg-primary-500/10 text-primary-600 dark:text-primary-400",
  resolved: "bg-success/10 text-success",
  closed: "bg-gray-100 dark:bg-gray-700 text-muted",
};

const priorityColors = {
  low: "bg-gray-100 dark:bg-gray-700 text-muted",
  medium: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  high: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  urgent: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function HelpSupport() {
  const { user } = useAuthStore();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    category: "general",
  });
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<{
    [key: string]: string;
  }>({});

  // Fetch support tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const res = await api.get("/support");
      const ticketsData = res.data.data || [];
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      console.error("Failed to load tickets:", err);
      setTickets([]);
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/support", contactForm);
      toast.success(
        "Support ticket submitted! Our team will respond within 24 hours.",
      );
      setContactForm({ subject: "", message: "", category: "general" });
      fetchTickets();
    } catch (err: any) {
      console.error("Failed to submit:", err);
      toast.error(
        err.response?.data?.message || "Failed to submit support request",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddResponse = async (ticketId: string) => {
    const msg = responseMessage[ticketId]?.trim();
    if (!msg) {
      toast.error("Please enter a response message");
      return;
    }

    try {
      await api.patch(`/support/${ticketId}/respond`, { message: msg });
      toast.success("Response added!");
      setResponseMessage({ ...responseMessage, [ticketId]: "" });
      fetchTickets();
    } catch (err: any) {
      console.error("Failed to add response:", err);
      toast.error(err.response?.data?.message || "Failed to add response");
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      await api.patch(`/support/${ticketId}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchTickets();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="page-container space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primaryText">
          Help & Support
        </h2>
        <p className="text-sm text-muted mt-1">
          Find answers or reach out to us
        </p>
      </div>

      {/* FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle size={16} /> Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-2">
          {faqs.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-border dark:border-gray-700 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm font-medium text-primaryText">
                  {q}
                </span>
                {faqOpen === i ? (
                  <ChevronUp size={16} className="text-muted shrink-0" />
                ) : (
                  <ChevronDown size={16} className="text-muted shrink-0" />
                )}
              </button>
              <AnimatePresence>
                {faqOpen === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-secondary dark:text-gray-400 leading-relaxed border-t border-border dark:border-gray-700 pt-3">
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail size={16} /> Contact Support
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Subject"
            placeholder="What do you need help with?"
            value={contactForm.subject}
            onChange={(e) =>
              setContactForm({ ...contactForm, subject: e.target.value })
            }
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-secondary dark:text-gray-200">
              Category
            </label>
            <select
              value={contactForm.category}
              onChange={(e) =>
                setContactForm({ ...contactForm, category: e.target.value })
              }
              className="input-base"
            >
              <option value="general">General</option>
              <option value="technical">Technical Issue</option>
              <option value="feature-request">Feature Request</option>
              <option value="bug-report">Bug Report</option>
              <option value="billing">Billing</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-secondary dark:text-gray-200">
              Message
            </label>
            <textarea
              placeholder="Describe your issue in detail..."
              value={contactForm.message}
              onChange={(e) =>
                setContactForm({ ...contactForm, message: e.target.value })
              }
              rows={4}
              className="input-base resize-none"
            />
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            <MessageSquare size={15} />{" "}
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </CardBody>
      </Card>

      {/* Support Tickets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle size={16} />
            {user?.role === "admin"
              ? "All Support Tickets"
              : "Your Support Tickets"}
          </CardTitle>
        </CardHeader>
        <CardBody>
          {loadingTickets ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No support tickets yet
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  className="border border-border dark:border-gray-700 rounded-xl p-4"
                >
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedTicket(
                        expandedTicket === ticket._id ? null : ticket._id,
                      )
                    }
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-primaryText">
                          {ticket.subject}
                        </h4>
                        <Badge variant="secondary" className="text-[10px]">
                          {ticket.category}
                        </Badge>
                        <Badge
                          variant={
                            statusColors[
                              ticket.status as keyof typeof statusColors
                            ]
                          }
                          className="text-[10px]"
                        >
                          {ticket.status}
                        </Badge>
                        <Badge
                          variant={
                            priorityColors[
                              ticket.priority as keyof typeof priorityColors
                            ]
                          }
                          className="text-[10px]"
                        >
                          {ticket.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted">
                        {user?.role === "admin" && ticket.submittedBy ? (
                          <>
                            Submitted by{" "}
                            <span className="font-medium">
                              {ticket.submittedBy.name}
                            </span>{" "}
                            •{" "}
                          </>
                        ) : null}
                        {formatDate(new Date(ticket.createdAt))}
                      </p>
                    </div>
                    {expandedTicket === ticket._id ? (
                      <ChevronUp size={18} className="text-muted ml-2" />
                    ) : (
                      <ChevronDown size={18} className="text-muted ml-2" />
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedTicket === ticket._id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 pt-4 border-t border-border dark:border-gray-700 space-y-3">
                          {/* Original Message */}
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <p className="text-xs text-muted mb-1">
                              Original Issue:
                            </p>
                            <p className="text-sm text-secondary dark:text-gray-300">
                              {ticket.message}
                            </p>
                          </div>

                          {/* Status Management (Admin Only) */}
                          {user?.role === "admin" && (
                            <div className="flex gap-2 flex-wrap">
                              {[
                                "open",
                                "in-progress",
                                "resolved",
                                "closed",
                              ].map((status) => (
                                <button
                                  key={status}
                                  onClick={() =>
                                    handleStatusChange(ticket._id, status)
                                  }
                                  className={`text-xs px-3 py-1.5 rounded-lg transition-all ${
                                    ticket.status === status
                                      ? "bg-primary-500 text-white"
                                      : "bg-gray-100 dark:bg-gray-700 text-muted hover:bg-gray-200"
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Responses */}
                          {ticket.responses && ticket.responses.length > 0 && (
                            <div className="bg-success/5 border border-success/20 p-3 rounded-lg">
                              <p className="text-xs font-semibold text-success mb-2">
                                Responses:
                              </p>
                              <div className="space-y-2">
                                {ticket.responses.map(
                                  (resp: any, i: number) => (
                                    <div key={i} className="text-sm">
                                      <p className="text-xs text-muted mb-1">
                                        <span className="font-medium text-secondary dark:text-gray-300">
                                          {resp.respondedBy?.name || "Admin"}
                                        </span>{" "}
                                        • {formatDate(new Date(resp.createdAt))}
                                      </p>
                                      <p className="text-sm text-secondary dark:text-gray-400">
                                        {resp.message}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          )}

                          {/* Add Response (Admin Only) */}
                          {user?.role === "admin" && (
                            <div className="flex gap-2">
                              <textarea
                                placeholder="Add admin response..."
                                value={responseMessage[ticket._id] || ""}
                                onChange={(e) =>
                                  setResponseMessage({
                                    ...responseMessage,
                                    [ticket._id]: e.target.value,
                                  })
                                }
                                rows={2}
                                className="input-base flex-1 resize-none text-sm"
                              />
                              <button
                                onClick={() => handleAddResponse(ticket._id)}
                                className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
