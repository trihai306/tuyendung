<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\AiAgent;
use App\Models\AiAgentScenario;
use App\Models\CompanyAiAgent;
use App\Services\AiAgentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiAgentController extends Controller
{
    public function __construct(
        private readonly AiAgentService $agentService,
    ) {
    }

    /**
     * Display listing of available AI agents (admin-created).
     * Employer can see all global agents + their activation status.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);

        $companyId = $company->id;

        // Get all global (admin-created) agents
        $agents = AiAgent::global()
            ->active()
            ->withCount('scenarios')
            ->get()
            ->map(function ($agent) use ($companyId) {
                $activation = CompanyAiAgent::where('ai_agent_id', $agent->id)
                    ->where('employer_profile_id', $companyId)
                    ->first();

                return [
                    'id' => $agent->id,
                    'name' => $agent->name,
                    'type' => $agent->type,
                    'description' => $agent->description,
                    'avatar' => $agent->avatar,
                    'config' => $agent->config,
                    'scenarios_count' => $agent->scenarios_count,
                    'success_rate' => $agent->getSuccessRate(),
                    // Company-specific data
                    'is_activated' => (bool) $activation?->is_active,
                    'company_config' => $activation?->config,
                    'activated_at' => $activation?->activated_at?->diffForHumans(),
                ];
            });

        // Stats for this company
        $activatedIds = CompanyAiAgent::where('employer_profile_id', $companyId)
            ->where('is_active', true)
            ->pluck('ai_agent_id');

        $stats = [
            'available' => AiAgent::global()->active()->count(),
            'activated' => $activatedIds->count(),
            'total_scenarios' => AiAgentScenario::whereIn('ai_agent_id', $activatedIds)->active()->count(),
            'today_actions' => 0,
        ];

        return Inertia::render('Employer/AiAgents/Index', [
            'agents' => $agents,
            'stats' => $stats,
        ]);
    }

    /**
     * Show agent detail with scenarios and logs (for activated agent).
     */
    public function show(Request $request, AiAgent $aiAgent): Response
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_unless($aiAgent->is_global, 404);

        $companyId = $company->id;

        $activation = CompanyAiAgent::where('ai_agent_id', $aiAgent->id)
            ->where('employer_profile_id', $companyId)
            ->first();

        $scenarios = $aiAgent->scenarios()
            ->orderByDesc('is_active')
            ->orderByDesc('last_run_at')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'trigger_type' => $s->trigger_type,
                    'trigger_config' => $s->trigger_config,
                    'actions' => $s->actions,
                    'is_active' => $s->is_active,
                    'last_run_at' => $s->last_run_at?->diffForHumans(),
                    'run_count' => $s->run_count,
                ];
            });

        $logs = $aiAgent->logs()
            ->with('scenario:id,name')
            ->orderByDesc('executed_at')
            ->limit(50)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'status' => $log->status,
                    'scenario_name' => $log->scenario?->name,
                    'input_data' => $log->input_data,
                    'output_data' => $log->output_data,
                    'error_message' => $log->error_message,
                    'executed_at' => $log->executed_at->format('H:i d/m/Y'),
                    'executed_at_relative' => $log->executed_at->diffForHumans(),
                ];
            });

        $agentStats = [
            'total_runs' => $aiAgent->logs()->count(),
            'success_runs' => $aiAgent->logs()->where('status', 'success')->count(),
            'failed_runs' => $aiAgent->logs()->where('status', 'failed')->count(),
            'today_runs' => $aiAgent->logs()->whereDate('executed_at', today())->count(),
            'success_rate' => $aiAgent->getSuccessRate(),
        ];

        return Inertia::render('Employer/AiAgents/Show', [
            'agent' => [
                'id' => $aiAgent->id,
                'name' => $aiAgent->name,
                'type' => $aiAgent->type,
                'description' => $aiAgent->description,
                'avatar' => $aiAgent->avatar,
                'config' => $aiAgent->config,
                'schedule' => $aiAgent->schedule,
                'is_activated' => (bool) $activation?->is_active,
                'company_config' => $activation?->config,
                'activated_at' => $activation?->activated_at?->diffForHumans(),
            ],
            'scenarios' => $scenarios,
            'logs' => $logs,
            'agentStats' => $agentStats,
        ]);
    }

    /**
     * Activate / deactivate an agent for the company.
     */
    public function toggleActivation(Request $request, AiAgent $aiAgent): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_unless($aiAgent->is_global, 404);

        $existing = CompanyAiAgent::where('ai_agent_id', $aiAgent->id)
            ->where('employer_profile_id', $company->id)
            ->first();

        if ($existing) {
            $existing->update(['is_active' => !$existing->is_active]);
            $label = $existing->is_active ? 'kich hoat' : 'huy kich hoat';
        } else {
            CompanyAiAgent::create([
                'employer_profile_id' => $company->id,
                'ai_agent_id' => $aiAgent->id,
                'is_active' => true,
                'activated_at' => now(),
            ]);
            $label = 'kich hoat';
        }

        $this->agentService->logAction($aiAgent, 'activation_toggled', 'success', [
            'company_id' => $company->id,
            'action' => $label,
        ]);

        return redirect()->back()
            ->with('success', "Da {$label} tro ly \"{$aiAgent->name}\" thanh cong.");
    }

    /**
     * Save company-specific configuration for an agent.
     */
    public function saveConfig(Request $request, AiAgent $aiAgent): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_unless($aiAgent->is_global, 404);

        $validated = $request->validate([
            'config' => ['nullable', 'array'],
            'config.channels' => ['nullable', 'array'],
            'config.channels.*' => ['string'],
            'config.prompt' => ['nullable', 'string', 'max:2000'],
        ]);

        $activation = CompanyAiAgent::updateOrCreate(
            [
                'employer_profile_id' => $company->id,
                'ai_agent_id' => $aiAgent->id,
            ],
            [
                'config' => $validated['config'] ?? [],
                'is_active' => true,
                'activated_at' => now(),
            ]
        );

        return redirect()->back()
            ->with('success', 'Da luu cau hinh thanh cong.');
    }

    /**
     * Run a scenario manually.
     */
    public function runScenario(Request $request, AiAgent $aiAgent, AiAgentScenario $scenario): RedirectResponse
    {
        $user = $request->user();
        $company = $user->getCompany();
        abort_unless($company, 403);
        abort_unless($aiAgent->is_global, 404);
        abort_if($scenario->ai_agent_id !== $aiAgent->id, 404);

        // Must be activated
        $activation = CompanyAiAgent::where('ai_agent_id', $aiAgent->id)
            ->where('employer_profile_id', $company->id)
            ->where('is_active', true)
            ->first();
        abort_unless((bool) $activation, 403, 'Vui long kich hoat tro ly truoc khi chay kich ban.');

        $this->agentService->runScenario($scenario);

        return redirect()->back()
            ->with('success', "Da chay kich ban \"{$scenario->name}\" thanh cong.");
    }
}
