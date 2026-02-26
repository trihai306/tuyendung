import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
    Bot,
    MessageSquare,
    Share2,
    UserSearch,
    Zap,
    Activity,
    BarChart3,
    Clock,
    Power,
    PowerOff,
    ArrowRight,
    Sparkles,
} from 'lucide-react';
import { useConfirm } from '@/hooks/use-confirm';
import ConfirmDialog from '@/Components/ConfirmDialog';

interface AgentData {
    id: number;
    name: string;
    type: 'messaging' | 'posting' | 'recruiting';
    description: string | null;
    avatar: string | null;
    config: Record<string, unknown> | null;
    scenarios_count: number;
    success_rate: number;
    is_activated: boolean;
    company_config: Record<string, unknown> | null;
    activated_at: string | null;
}

interface Stats {
    available: number;
    activated: number;
    total_scenarios: number;
    today_actions: number;
}

interface Props {
    agents: AgentData[];
    stats: Stats;
}

const TYPE_CONFIG: Record<string, { label: string; icon: typeof Bot; color: string; bg: string; gradient: string }> = {
    messaging: {
        label: 'Tin nhan',
        icon: MessageSquare,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/10 border-blue-500/20',
        gradient: 'from-blue-500/20 to-blue-600/5',
    },
    posting: {
        label: 'Dang tin',
        icon: Share2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20',
        gradient: 'from-emerald-500/20 to-emerald-600/5',
    },
    recruiting: {
        label: 'Tuyen dung',
        icon: UserSearch,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-500/10 border-violet-500/20',
        gradient: 'from-violet-500/20 to-violet-600/5',
    },
};

export default function Index({ agents, stats }: Props) {
    const { isOpen, title, description, confirm, handleConfirm, handleCancel } = useConfirm();

    const handleToggle = (agent: AgentData) => {
        const action = agent.is_activated ? 'huy kich hoat' : 'kich hoat';
        confirm(
            `${action.charAt(0).toUpperCase() + action.slice(1)} tro ly`,
            `Ban co chac muon ${action} "${agent.name}"?`,
            () => router.patch(route('employer.ai-agents.toggle', agent.id))
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tro ly AI" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">Tro ly AI</h1>
                            <Badge variant="secondary" className="gap-1 text-xs">
                                <Sparkles className="h-3 w-3" />
                                AI-Powered
                            </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Khám phá và kích hoạt các trợ lý AI để tự động hóa quy trình tuyển dụng
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Co san', value: stats.available, icon: Bot, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                        { label: 'Da kich hoat', value: stats.activated, icon: Power, color: 'text-green-500', bg: 'bg-green-500/10' },
                        { label: 'Kich ban hoat dong', value: stats.total_scenarios, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { label: 'Thao tac hom nay', value: stats.today_actions, icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    ].map((s) => (
                        <Card key={s.label} className="relative overflow-hidden">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                                    </div>
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                                        <s.icon className={`h-5 w-5 ${s.color}`} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Agent Grid */}
                {agents.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">Chua co tro ly AI nao</h3>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                He thong chua co tro ly AI nao. Vui long lien he quan tri vien de tao tro ly.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {agents.map((agent) => {
                            const typeCfg = TYPE_CONFIG[agent.type];
                            const TypeIcon = typeCfg.icon;

                            return (
                                <Card key={agent.id} className={`group relative overflow-hidden hover:shadow-lg transition-all duration-300 ${agent.is_activated ? 'border-primary/30 shadow-sm' : 'hover:border-primary/20'}`}>
                                    {/* Gradient top bar */}
                                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${typeCfg.gradient} ${agent.is_activated ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'} transition-opacity`} />

                                    <CardContent className="p-5">
                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${typeCfg.bg}`}>
                                                    <TypeIcon className={`h-6 w-6 ${typeCfg.color}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-sm">{agent.name}</h3>
                                                    <Badge variant="outline" className={`text-[10px] mt-1 ${typeCfg.bg} ${typeCfg.color} border`}>
                                                        {typeCfg.label}
                                                    </Badge>
                                                </div>
                                            </div>
                                            {agent.is_activated && (
                                                <Badge className="bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] gap-1">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Da kich hoat
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Description */}
                                        {agent.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                                                {agent.description}
                                            </p>
                                        )}

                                        {/* Stats */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                                                <Zap className="h-3.5 w-3.5 text-amber-500" />
                                                <div>
                                                    <p className="text-sm font-bold">{agent.scenarios_count}</p>
                                                    <p className="text-[10px] text-muted-foreground">Kich ban</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                                                <Activity className="h-3.5 w-3.5 text-blue-500" />
                                                <div>
                                                    <p className="text-sm font-bold">{agent.success_rate}%</p>
                                                    <p className="text-[10px] text-muted-foreground">Thanh cong</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center gap-2 pt-3 border-t">
                                            <Button
                                                variant={agent.is_activated ? 'outline' : 'default'}
                                                size="sm"
                                                className="flex-1 gap-1.5 h-9 text-xs"
                                                onClick={() => handleToggle(agent)}
                                            >
                                                {agent.is_activated ? (
                                                    <><PowerOff className="h-3.5 w-3.5" /> Huy kich hoat</>
                                                ) : (
                                                    <><Power className="h-3.5 w-3.5" /> Kich hoat</>
                                                )}
                                            </Button>
                                            <Link href={route('employer.ai-agents.show', agent.id)}>
                                                <Button variant="outline" size="sm" className="h-9 gap-1 text-xs">
                                                    Chi tiet
                                                    <ArrowRight className="h-3 w-3" />
                                                </Button>
                                            </Link>
                                        </div>

                                        {/* Activation date */}
                                        {agent.is_activated && agent.activated_at && (
                                            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                Kich hoat {agent.activated_at}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
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
