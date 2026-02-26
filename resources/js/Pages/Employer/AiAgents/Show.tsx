import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    Bot,
    ArrowLeft,
    Power,
    PowerOff,
    Zap,
    Activity,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    MessageSquare,
    Share2,
    UserSearch,
    BarChart3,
    Loader2,
    Play,
    Settings,
    Save,
} from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useState } from 'react';

interface Agent {
    id: number;
    name: string;
    type: 'messaging' | 'posting' | 'recruiting';
    description: string | null;
    avatar: string | null;
    config: Record<string, unknown> | null;
    schedule: Record<string, unknown> | null;
    is_activated: boolean;
    company_config: {
        channels?: string[];
        prompt?: string;
    } | null;
    activated_at: string | null;
}

interface Scenario {
    id: number;
    name: string;
    trigger_type: 'manual' | 'scheduled' | 'event';
    trigger_config: Record<string, unknown> | null;
    actions: Array<{ type: string; config: Record<string, unknown> }>;
    is_active: boolean;
    last_run_at: string | null;
    run_count: number;
}

interface LogEntry {
    id: number;
    action: string;
    status: 'success' | 'failed' | 'pending';
    scenario_name: string | null;
    input_data: Record<string, unknown> | null;
    output_data: Record<string, unknown> | null;
    error_message: string | null;
    executed_at: string;
    executed_at_relative: string;
}

interface AgentStats {
    total_runs: number;
    success_runs: number;
    failed_runs: number;
    today_runs: number;
    success_rate: number;
}

interface Props {
    agent: Agent;
    scenarios: Scenario[];
    logs: LogEntry[];
    agentStats: AgentStats;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Bot; color: string; bg: string }> = {
    messaging: { label: 'Tro ly Tin nhan', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    posting: { label: 'Tro ly Dang tin', icon: Share2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    recruiting: { label: 'Tro ly Tuyen dung', icon: UserSearch, color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
};

const TRIGGER_LABELS: Record<string, string> = {
    manual: 'Thu cong',
    scheduled: 'Theo lich',
    event: 'Theo su kien',
};

const LOG_STATUS_CONFIG: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
    success: { icon: CheckCircle2, color: 'text-green-500', label: 'Thanh cong' },
    failed: { icon: XCircle, color: 'text-red-500', label: 'That bai' },
    pending: { icon: Loader2, color: 'text-yellow-500', label: 'Dang chay' },
};

const ACTION_LABELS: Record<string, string> = {
    activation_toggled: 'Thay doi kich hoat',
    agent_created: 'Tao tro ly',
    agent_updated: 'Cap nhat tro ly',
    status_changed: 'Thay doi trang thai',
    scenario_executed: 'Chay kich ban',
    send_greeting: 'Gui loi chao',
    auto_reply: 'Tu dong tra loi',
    send_notification: 'Gui thong bao',
    post_job: 'Dang tin tuyen dung',
    post_to_groups: 'Dang len nhom',
    screen_cv: 'Loc ho so',
    schedule_interview: 'Len lich phong van',
};

const CHANNEL_OPTIONS = [
    { value: 'zalo', label: 'Zalo' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'email', label: 'Email' },
];

export default function Show({ agent, scenarios, logs, agentStats }: Props) {
    const { isOpen, title, description, confirm, handleConfirm, handleCancel } = useConfirm();
    const typeCfg = TYPE_CONFIG[agent.type];
    const TypeIcon = typeCfg.icon;

    const [selectedChannels, setSelectedChannels] = useState<string[]>(
        agent.company_config?.channels || []
    );
    const [prompt, setPrompt] = useState(agent.company_config?.prompt || '');
    const [configSaving, setConfigSaving] = useState(false);

    const handleToggle = () => {
        const action = agent.is_activated ? 'huy kich hoat' : 'kich hoat';
        confirm(
            `${action.charAt(0).toUpperCase() + action.slice(1)} tro ly`,
            `Ban co chac muon ${action} "${agent.name}"?`,
            () => router.patch(route('employer.ai-agents.toggle', agent.id))
        );
    };

    const handleRunScenario = (scenario: Scenario) => {
        confirm(
            'Chay kich ban',
            `Ban co chac muon chay "${scenario.name}"?`,
            () => router.post(route('employer.ai-agents.run-scenario', [agent.id, scenario.id]))
        );
    };

    const handleSaveConfig = () => {
        setConfigSaving(true);
        router.post(route('employer.ai-agents.config', agent.id), {
            config: {
                channels: selectedChannels,
                prompt: prompt,
            },
        }, {
            onFinish: () => setConfigSaving(false),
        });
    };

    const toggleChannel = (ch: string) => {
        setSelectedChannels(prev =>
            prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${agent.name} - Tro ly AI`} />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('employer.ai-agents.index')}>
                            <Button variant="ghost" size="sm" className="gap-1.5">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${typeCfg.bg}`}>
                            <TypeIcon className={`h-7 w-7 ${typeCfg.color}`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold">{agent.name}</h1>
                                {agent.is_activated ? (
                                    <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Da kich hoat
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                        Chua kich hoat
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="outline" className={`text-[10px] ${typeCfg.bg} ${typeCfg.color}`}>
                                    {typeCfg.label}
                                </Badge>
                                {agent.activated_at && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Kich hoat {agent.activated_at}
                                    </span>
                                )}
                            </div>
                            {agent.description && (
                                <p className="text-sm text-muted-foreground mt-2 max-w-lg">{agent.description}</p>
                            )}
                        </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handleToggle}>
                        {agent.is_activated ? (
                            <><PowerOff className="h-4 w-4 text-red-500" /> Huy kich hoat</>
                        ) : (
                            <><Power className="h-4 w-4 text-green-500" /> Kich hoat</>
                        )}
                    </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Tong luot chay', value: agentStats.total_runs, icon: Activity, color: 'text-indigo-500' },
                        { label: 'Thanh cong', value: agentStats.success_runs, icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'That bai', value: agentStats.failed_runs, icon: XCircle, color: 'text-red-500' },
                        { label: 'Hom nay', value: agentStats.today_runs, icon: BarChart3, color: 'text-blue-500' },
                        { label: 'Ti le', value: `${agentStats.success_rate}%`, icon: Zap, color: 'text-amber-500' },
                    ].map((s) => (
                        <Card key={s.label}>
                            <CardContent className="p-3 flex items-center gap-3">
                                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                                <div>
                                    <p className="text-lg font-bold">{s.value}</p>
                                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs */}
                <Tabs defaultValue="scenarios" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="scenarios" className="gap-1.5">
                            <Zap className="h-3.5 w-3.5" /> Kich ban ({scenarios.length})
                        </TabsTrigger>
                        <TabsTrigger value="logs" className="gap-1.5">
                            <Activity className="h-3.5 w-3.5" /> Nhat ky ({logs.length})
                        </TabsTrigger>
                        <TabsTrigger value="config" className="gap-1.5">
                            <Settings className="h-3.5 w-3.5" /> Cau hinh
                        </TabsTrigger>
                    </TabsList>

                    {/* Scenarios Tab */}
                    <TabsContent value="scenarios" className="space-y-3">
                        {scenarios.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center py-12 text-center">
                                    <Zap className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium">Chua co kich ban nao</p>
                                    <p className="text-xs text-muted-foreground mt-1">Tro ly nay chua duoc cau hinh kich ban boi quan tri vien</p>
                                </CardContent>
                            </Card>
                        ) : (
                            scenarios.map((scenario) => (
                                <Card key={scenario.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${scenario.is_active ? 'bg-primary/10' : 'bg-muted'}`}>
                                                    <Zap className={`h-5 w-5 ${scenario.is_active ? 'text-primary' : 'text-muted-foreground'}`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm">{scenario.name}</p>
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {TRIGGER_LABELS[scenario.trigger_type]}
                                                        </Badge>
                                                        {!scenario.is_active && (
                                                            <Badge variant="outline" className="text-[10px] text-muted-foreground">Da tat</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <Activity className="h-3 w-3" />
                                                            {scenario.run_count} luot chay
                                                        </span>
                                                        {scenario.last_run_at && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {scenario.last_run_at}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {scenario.actions.length > 0 && (
                                                    <div className="flex gap-1">
                                                        {scenario.actions.slice(0, 3).map((a, i) => (
                                                            <Badge key={i} variant="secondary" className="text-[10px]">
                                                                {ACTION_LABELS[a.type] || a.type}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-1.5 h-8 text-xs"
                                                    onClick={() => handleRunScenario(scenario)}
                                                    disabled={!scenario.is_active || !agent.is_activated}
                                                >
                                                    <Play className="h-3 w-3" />
                                                    Chay
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}

                        {!agent.is_activated && scenarios.length > 0 && (
                            <div className="text-center py-3">
                                <p className="text-xs text-muted-foreground">
                                    Kich hoat tro ly de co the chay cac kich ban
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Logs Tab */}
                    <TabsContent value="logs" className="space-y-2">
                        {logs.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center py-12 text-center">
                                    <Activity className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                    <p className="text-sm font-medium">Chua co hoat dong nao</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-2">
                                {logs.map((log) => {
                                    const logCfg = LOG_STATUS_CONFIG[log.status];
                                    const LogIcon = logCfg.icon;
                                    return (
                                        <Card key={log.id}>
                                            <CardContent className="p-3">
                                                <div className="flex items-center gap-3">
                                                    <LogIcon className={`h-4 w-4 shrink-0 ${logCfg.color}`} />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium">
                                                                {ACTION_LABELS[log.action] || log.action}
                                                            </span>
                                                            {log.scenario_name && (
                                                                <Badge variant="secondary" className="text-[10px]">
                                                                    {log.scenario_name}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {log.error_message && (
                                                            <p className="text-xs text-destructive mt-0.5 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" />
                                                                {log.error_message}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground shrink-0">
                                                        {log.executed_at_relative}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </TabsContent>

                    {/* Config Tab - company-specific settings */}
                    <TabsContent value="config" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Settings className="h-5 w-5 text-primary" />
                                    Cau hinh cho cong ty cua ban
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-5">
                                {/* Channels */}
                                <div>
                                    <Label>Kenh hoat dong</Label>
                                    <div className="grid grid-cols-3 gap-3 mt-2">
                                        {CHANNEL_OPTIONS.map((ch) => (
                                            <button
                                                key={ch.value}
                                                type="button"
                                                onClick={() => toggleChannel(ch.value)}
                                                className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${selectedChannels.includes(ch.value)
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-border hover:border-primary/30'
                                                    }`}
                                            >
                                                {ch.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Prompt */}
                                {agent.type === 'messaging' && (
                                    <div>
                                        <Label htmlFor="prompt">Prompt AI (huong dan tra loi cua cong ty ban)</Label>
                                        <Textarea
                                            id="prompt"
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            className="mt-1.5 min-h-[100px]"
                                            placeholder="VD: Ban la tro ly tuyen dung cua cong ty ABC. Hay tra loi lich su va chuyen nghiep..."
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleSaveConfig}
                                        disabled={configSaving || !agent.is_activated}
                                        className="gap-2"
                                    >
                                        <Save className="h-4 w-4" />
                                        {configSaving ? 'Dang luu...' : 'Luu cau hinh'}
                                    </Button>
                                </div>

                                {!agent.is_activated && (
                                    <p className="text-xs text-muted-foreground text-center">
                                        Vui long kich hoat tro ly truoc khi cau hinh
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <ConfirmDialog
                isOpen={isOpen}
                title={title}
                description={description}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </AuthenticatedLayout>
    );
}
