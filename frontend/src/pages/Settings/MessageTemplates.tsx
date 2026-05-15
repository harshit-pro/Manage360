import { useEffect, useState } from "react";
import { 
  MessageSquare, 
  Save, 
  Info,
  Settings,
  Gem,
  Zap,
  User,
  Calendar,
  Wallet,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentLibrary, updateLibrary, type Library } from "@/lib/library";
import { updateLibraryMetadata } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TemplateConfig {
  welcome: string;
  registration: string;
  renewal: string;
  reminder: string;
  dues: string;
}

const DEFAULT_TEMPLATES: TemplateConfig = {
  welcome: "Hello {{student_name}}! Welcome to {{library_name}}. We are thrilled to have you join us. Please let us know if you need any assistance getting started.",
  registration: "*✨ Registration Successful - {{library_name}} ✨*\n\nDear *{{student_name}}*, Your registration for Seat {{seat_no}} is successful. Valid until {{validity}}.",
  renewal: "*✨ Membership Renewed - {{library_name}} ✨*\n\nDear *{{student_name}}*, Your membership is extended until {{validity}}. Amount Paid: {{amount}}.",
  reminder: "Hi {{student_name}}, your membership at {{library_name}} is expiring on {{expiry_date}}. Please renew to keep your seat.",
  dues: "Hi {{student_name}}, reminder for pending fee of {{amount}} at {{library_name}}. Please clear at earliest."
};

const VARIABLES = [
  { key: "{{student_name}}", label: "Student Name", icon: User, color: "text-blue-500" },
  { key: "{{library_name}}", label: "Library Name", icon: Settings, color: "text-purple-500" },
  { key: "{{seat_no}}", label: "Seat Number", icon: Gem, color: "text-amber-500" },
  { key: "{{validity}}", label: "Validity Date", icon: Calendar, color: "text-emerald-500" },
  { key: "{{expiry_date}}", label: "Expiry Date", icon: AlertCircle, color: "text-red-500" },
  { key: "{{amount}}", label: "Amount / Fees", icon: Wallet, color: "text-indigo-500" },
  { key: "{{reg_no}}", label: "Reg Number", icon: Info, color: "text-slate-500" },
];

export default function MessageTemplates() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [templates, setTemplates] = useState<TemplateConfig>(DEFAULT_TEMPLATES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchConfig() {
      try {
        const data = await getCurrentLibrary();
        setLibrary(data);
        if (data.templatesJson) {
          try {
            const custom = JSON.parse(data.templatesJson);
            setTemplates({ ...DEFAULT_TEMPLATES, ...custom });
          } catch (e) {
            console.error("Failed to parse templates", e);
          }
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load messaging config.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [toast]);

  const handleSave = async () => {
    if (!library) return;
    setSaving(true);
    try {
      const updated = await updateLibrary({
        id: library.id,
        templatesJson: JSON.stringify(templates)
      });
      setLibrary(updated);
      updateLibraryMetadata(updated.name, updated.totalSeats, updated.templatesJson);
      toast({ title: "Templates Saved", description: "Your custom messages are now active." });
    } catch (error) {
      toast({ title: "Save Failed", description: "Could not update templates.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = (key: keyof TemplateConfig, value: string) => {
    setTemplates(prev => ({ ...prev, [key]: value }));
  };

  const insertVariable = (key: keyof TemplateConfig, variable: string) => {
    const textarea = document.getElementById(`template-${key}`) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = templates[key];
    const newText = currentText.substring(0, start) + variable + currentText.substring(end);
    
    updateTemplate(key, newText);
    
    // Set focus back and move cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse p-4">
        <Skeleton className="h-48 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[500px] rounded-[2rem]" />
          <Skeleton className="h-[500px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-primary border border-primary/20">
              <Zap className="h-3.5 w-3.5" />
              Automated Messaging
            </div>
            <h1 className="text-4xl font-black md:text-5xl tracking-tight leading-none">
              Communication <span className="text-primary">Hub</span>
            </h1>
            <p className="text-slate-400 font-medium max-w-sm">Customize your automated WhatsApp messages to students with dynamic variables.</p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-16 px-10 rounded-2xl bg-white text-slate-950 font-black text-lg gap-3 hover:bg-primary hover:text-white transition-all active:scale-95 shadow-xl"
          >
            {saving ? <div className="h-5 w-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
            Save Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Editor */}
        <div className="lg:col-span-8 space-y-8">
          <Tabs defaultValue="onboarding" className="w-full">
            <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-auto mb-6">
              <TabsTrigger value="onboarding" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Onboarding</TabsTrigger>
              <TabsTrigger value="renewals" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Renewals</TabsTrigger>
              <TabsTrigger value="reminders" className="rounded-xl px-6 py-2.5 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Alerts & Dues</TabsTrigger>
            </TabsList>

            <TabsContent value="onboarding" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <TemplateEditor 
                title="Welcome Message"
                description="Sent when a student is first added to the system."
                id="welcome"
                value={templates.welcome}
                onChange={(v) => updateTemplate("welcome", v)}
                onInsert={(v) => insertVariable("welcome", v)}
              />
              <TemplateEditor 
                title="Registration Confirmation"
                description="Sent immediately after a successful registration with seat details."
                id="registration"
                value={templates.registration}
                onChange={(v) => updateTemplate("registration", v)}
                onInsert={(v) => insertVariable("registration", v)}
              />
            </TabsContent>

            <TabsContent value="renewals" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <TemplateEditor 
                title="Renewal Confirmation"
                description="Sent after a membership is successfully renewed."
                id="renewal"
                value={templates.renewal}
                onChange={(v) => updateTemplate("renewal", v)}
                onInsert={(v) => insertVariable("renewal", v)}
              />
            </TabsContent>

            <TabsContent value="reminders" className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <TemplateEditor 
                title="Expiry Reminder"
                description="Friendly reminder sent before membership expires."
                id="reminder"
                value={templates.reminder}
                onChange={(v) => updateTemplate("reminder", v)}
                onInsert={(v) => insertVariable("reminder", v)}
              />
              <TemplateEditor 
                title="Pending Dues Alert"
                description="Reminder for students with outstanding balances."
                id="dues"
                value={templates.dues}
                onChange={(v) => updateTemplate("dues", v)}
                onInsert={(v) => insertVariable("dues", v)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar - Variables & Preview */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl bg-white overflow-hidden">
            <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Copy className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg font-black">Dynamic Variables</CardTitle>
              </div>
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Click to copy/use in your messages</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-2">
                {VARIABLES.map((v) => (
                  <button
                    key={v.key}
                    onClick={() => {
                      navigator.clipboard.writeText(v.key);
                      toast({ title: "Copied", description: `${v.label} variable copied to clipboard.` });
                    }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("h-8 w-8 rounded-lg bg-current/10 flex items-center justify-center", v.color)}>
                        <v.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{v.label}</span>
                    </div>
                    <code className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {v.key}
                    </code>
                  </button>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex gap-3">
                <Info className="h-5 w-5 text-amber-500 shrink-0" />
                <p className="text-[10px] leading-relaxed text-amber-700 font-medium">
                  Variables are placeholders that will be replaced with real data (like the student's name) when the message is sent.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Placeholder */}
          <Card className="rounded-[2.5rem] border-slate-200/60 shadow-2xl bg-slate-900 overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
             <CardHeader className="p-8 relative z-10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-black text-white">WhatsApp Preview</CardTitle>
                </div>
                <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">Real-time visualization</CardDescription>
             </CardHeader>
             <CardContent className="p-8 relative z-10">
                <div className="aspect-[9/16] rounded-[2rem] bg-slate-800 border-4 border-slate-700 p-4 shadow-inner overflow-hidden flex flex-col">
                  <div className="h-6 w-1/3 bg-slate-700 rounded-full self-center mb-6" />
                  
                  <div className="space-y-4">
                    <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-lg animate-in slide-in-from-bottom-2 duration-300">
                      <div className="text-[11px] text-emerald-600 font-black flex items-center gap-1 mb-1">
                        <CheckCircle2 className="h-3 w-3" />
                        INSTITUTE SYSTEM
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                        {templates.welcome.replace("{{student_name}}", "Rahul Sharma").replace("{{library_name}}", library?.name || "Manage360")}
                      </p>
                      <div className="text-[9px] text-slate-400 text-right mt-2 font-bold uppercase tracking-widest">
                        12:45 PM ✓✓
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-700 flex gap-2">
                    <div className="flex-1 h-8 rounded-full bg-slate-700" />
                    <div className="h-8 w-8 rounded-full bg-primary" />
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-500 mt-6 font-medium italic">This is a mock-up of how the message appears in WhatsApp.</p>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function TemplateEditor({ 
  title, 
  description, 
  id, 
  value, 
  onChange, 
  onInsert 
}: { 
  title: string; 
  description: string; 
  id: string; 
  value: string; 
  onChange: (v: string) => void;
  onInsert: (v: string) => void;
}) {
  return (
    <Card className="rounded-[2.5rem] border-slate-200/60 shadow-xl bg-white overflow-hidden group hover:border-primary/20 transition-all duration-300">
      <CardHeader className="p-8 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-800">{title}</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 mt-1">{description}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-slate-50 font-bold uppercase text-[9px] tracking-widest border-slate-200">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {VARIABLES.slice(0, 4).map(v => (
              <button
                key={v.key}
                onClick={() => onInsert(v.key)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-[10px] font-black text-slate-600 hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/10"
              >
                <v.icon className="h-3 w-3" />
                INSERT {v.label.split(" ")[1] || v.label}
              </button>
            ))}
          </div>
          
          <div className="relative">
            <Textarea 
              id={`template-${id}`}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[200px] rounded-[1.5rem] border-slate-200 focus:ring-primary focus:border-primary p-6 text-sm font-medium leading-relaxed resize-none shadow-inner bg-slate-50/30"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{value.length} Characters</div>
              <ChevronRight className="h-3 w-3 text-slate-300" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
