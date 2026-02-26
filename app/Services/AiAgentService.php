<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AiAgent;
use App\Models\AiAgentLog;
use App\Models\AiAgentScenario;

class AiAgentService
{
    /**
     * Create a new AI agent.
     */
    public function createAgent(array $data): AiAgent
    {
        $agent = AiAgent::create($data);

        // Log creation
        $this->logAction($agent, 'agent_created', 'success', [
            'name' => $agent->name,
            'type' => $agent->type,
        ]);

        return $agent;
    }

    /**
     * Update an existing AI agent.
     */
    public function updateAgent(AiAgent $agent, array $data): AiAgent
    {
        $agent->update($data);

        $this->logAction($agent, 'agent_updated', 'success', [
            'updated_fields' => array_keys($data),
        ]);

        return $agent;
    }

    /**
     * Toggle agent status (active <-> paused).
     */
    public function toggleStatus(AiAgent $agent): AiAgent
    {
        $newStatus = $agent->status === 'active' ? 'paused' : 'active';
        $agent->update([
            'status' => $newStatus,
            'last_active_at' => $newStatus === 'active' ? now() : $agent->last_active_at,
        ]);

        $this->logAction($agent, 'status_changed', 'success', [
            'new_status' => $newStatus,
        ]);

        return $agent;
    }

    /**
     * Delete an AI agent.
     */
    public function deleteAgent(AiAgent $agent): void
    {
        $agent->delete();
    }

    /**
     * Create a scenario for an agent.
     */
    public function createScenario(AiAgent $agent, array $data): AiAgentScenario
    {
        $data['ai_agent_id'] = $agent->id;

        return AiAgentScenario::create($data);
    }

    /**
     * Update a scenario.
     */
    public function updateScenario(AiAgentScenario $scenario, array $data): AiAgentScenario
    {
        $scenario->update($data);

        return $scenario;
    }

    /**
     * Run a scenario manually.
     */
    public function runScenario(AiAgentScenario $scenario): AiAgentLog
    {
        $agent = $scenario->agent;

        // Create pending log
        $log = $this->logAction($agent, 'scenario_executed', 'success', [
            'scenario_name' => $scenario->name,
            'trigger_type' => 'manual',
        ], null, $scenario);

        // Update scenario run count
        $scenario->update([
            'last_run_at' => now(),
            'run_count' => $scenario->run_count + 1,
        ]);

        // Update agent last active
        $agent->update(['last_active_at' => now()]);

        return $log;
    }

    /**
     * Log an agent action.
     */
    public function logAction(
        AiAgent $agent,
        string $action,
        string $status = 'success',
        ?array $inputData = null,
        ?array $outputData = null,
        ?AiAgentScenario $scenario = null,
        ?string $errorMessage = null,
    ): AiAgentLog {
        return AiAgentLog::create([
            'ai_agent_id' => $agent->id,
            'scenario_id' => $scenario?->id,
            'action' => $action,
            'status' => $status,
            'input_data' => $inputData,
            'output_data' => $outputData,
            'error_message' => $errorMessage,
            'executed_at' => now(),
        ]);
    }

    /**
     * Get stats for dashboard.
     */
    public function getCompanyStats(int $companyId): array
    {
        $agents = AiAgent::forCompany($companyId);

        return [
            'total_agents' => (clone $agents)->count(),
            'active_agents' => (clone $agents)->active()->count(),
            'total_scenarios' => AiAgentScenario::whereIn(
                'ai_agent_id',
                (clone $agents)->pluck('id')
            )->active()->count(),
            'today_actions' => AiAgentLog::whereIn(
                'ai_agent_id',
                (clone $agents)->pluck('id')
            )->whereDate('executed_at', today())->count(),
        ];
    }
}
