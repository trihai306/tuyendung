<?php

namespace App\Events;

use App\Models\JobApplication;
use App\Models\PipelineStage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ApplicationStageChanged implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public JobApplication $application,
        public PipelineStage $fromStage,
        public PipelineStage $toStage
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("user.{$this->application->job->user_id}"),
            new PrivateChannel("job.{$this->application->job_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'application.stage_changed';
    }

    public function broadcastWith(): array
    {
        return [
            'application_id' => $this->application->id,
            'job_id' => $this->application->job_id,
            'candidate_id' => $this->application->candidate_id,
            'from_stage' => [
                'id' => $this->fromStage->id,
                'slug' => $this->fromStage->slug,
                'name' => $this->fromStage->name,
            ],
            'to_stage' => [
                'id' => $this->toStage->id,
                'slug' => $this->toStage->slug,
                'name' => $this->toStage->name,
            ],
        ];
    }
}
