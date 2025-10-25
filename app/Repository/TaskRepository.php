<?php

namespace App\Repositories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

class TaskRepository
{
    public function findByOrganization($organizationId): Collection
    {
        return Task::where('organization_id', $organizationId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function create(array $data): Task
    {
        return Task::create($data);
    }

    public function find($id): ?Task
    {
        return Task::findOrFail($id);
    }

    public function update(Task $task, array $data): Task
    {
        $task->update($data);
        return $task;
    }

    public function delete(Task $task): void
    {
        $task->delete();
    }
}
