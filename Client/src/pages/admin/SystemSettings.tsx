import { useState } from "react";
import { Settings, Key, Clock, Save } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
} from "../../components/ui/Card";
import ThemeSettings from "./ThemeSettings";

export default function SystemSettings() {
  const [form, setForm] = useState({
    appName: "InternPulse",
    aiKey: "",
    fridayCron: "0 18 * * 5",
    mondayCron: "0 9 * * 1",
  });

  return (
    <div className="page-container space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primaryText">
          System Settings
        </h2>
        <p className="text-sm text-muted mt-1">
          Configure platform-wide settings
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings size={16} /> General
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="App Name"
            value={form.appName}
            onChange={(e) => setForm({ ...form, appName: e.target.value })}
          />
          <Button onClick={() => toast.success("Settings saved!")}>
            <Save size={15} /> Save Changes
          </Button>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={16} /> AI Configuration
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="OpenAI API Key"
            type="password"
            placeholder="sk-..."
            value={form.aiKey}
            onChange={(e) => setForm({ ...form, aiKey: e.target.value })}
          />
          <Button onClick={() => toast.success("API key saved!")}>
            <Save size={15} /> Save Key
          </Button>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={16} /> CRON Schedules
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Friday Reminder (Interns)"
            value={form.fridayCron}
            onChange={(e) => setForm({ ...form, fridayCron: e.target.value })}
          />
          <Input
            label="Monday Reminder (Managers)"
            value={form.mondayCron}
            onChange={(e) => setForm({ ...form, mondayCron: e.target.value })}
          />
          <Button onClick={() => toast.success("CRON schedules updated!")}>
            <Save size={15} /> Update Schedule
          </Button>
        </CardBody>
      </Card>

      {/* Theme Settings Component */}
      <ThemeSettings />
    </div>
  );
}
