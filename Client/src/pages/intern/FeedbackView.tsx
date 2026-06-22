import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Sparkles,
  AlertCircle,
  RefreshCcw,
  Paperclip,
  Download,
  FileText,
  CheckCircle
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { reportService } from "../../services/reportService";
import { formatDateTime } from "../../utils/formatDate";

export default function FeedbackView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    reportService
      .getReportById(id)
      .then((res) => {
        const reportData = res.data.data || res.data;
        setReport(reportData);
      })
      .catch((err) => {
        console.error("Failed to load report:", err);
        setReport(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="page-container">
        <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    );
  if (!report) return null;

  const isApproved = report.status === "Approved";
  const isRevision = report.status === "Revision-Required";

  return (
    <div className="page-container space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-muted hover:text-primary-500 transition-colors"
      >
        <ArrowLeft size={16} /> Back to History
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Status banner */}
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 ${isApproved ? "bg-success/10 border border-success/20" : "bg-danger/10 border border-danger/20"}`}
        >
          {isApproved ? (
            <CheckCircle size={22} className="text-success shrink-0" />
          ) : (
            <AlertCircle size={22} className="text-danger shrink-0" />
          )}
          <div>
            <p
              className={`font-semibold text-sm ${isApproved ? "text-success" : "text-danger"}`}
            >
              {isApproved ? "🎉 Report Approved!" : "⚠️ Revision Required"}
            </p>
            <p className="text-xs text-muted">{report.goal?.title}</p>
          </div>
          {report.score != null && (
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-primaryText">
                {report.score}
                <span className="text-sm text-muted">/100</span>
              </p>
              <div className="flex gap-0.5 justify-end">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={12}
                    className={
                      s <= Math.round(report.score / 20)
                        ? "text-warning fill-warning"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Summary */}
        {report.aiSummary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={16} className="text-purple-500" />
                AI Summary
              </CardTitle>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                Powered by AI
              </span>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-secondary dark:text-gray-400 italic leading-relaxed">
                "{report.aiSummary}"
              </p>
            </CardBody>
          </Card>
        )}

        {/* Manager Feedback */}
        {report.managerFeedback && (
          <Card>
            <CardHeader>
              <CardTitle>Manager Feedback</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  M
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary dark:text-gray-400 leading-relaxed">
                    {report.managerFeedback}
                  </p>
                  <p className="text-xs text-muted mt-2">
                    Reviewed {formatDateTime(report.reviewedAt)}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Report content */}
        <Card>
          <CardHeader>
            <CardTitle>Your Report</CardTitle>
          </CardHeader>
          <CardBody>
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-sm text-secondary dark:text-gray-400"
              dangerouslySetInnerHTML={{ __html: report.content }}
            />
          </CardBody>
        </Card>

        {report.attachments && report.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip size={16} className="text-primary-500" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid sm:grid-cols-2 gap-3">
                {report.attachments.map((att: any) => (
                  <a key={att._id} href={att.url} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-border dark:border-gray-700">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={16} className="text-muted shrink-0" />
                      <span className="text-xs font-medium truncate text-primaryText">{att.originalName}</span>
                    </div>
                    <Download size={14} className="text-muted shrink-0" />
                  </a>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {isRevision && (
          <Button
            onClick={() =>
              navigate(`/intern/reports/new?goalId=${report.goal?._id}`)
            }
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <RefreshCcw size={16} /> Resubmit Report
          </Button>
        )}
      </motion.div>
    </div>
  );
}
