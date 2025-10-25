<?php

namespace App\Services;

use App\Repositories\TaskRepository;
use Illuminate\Auth\Access\AuthorizationException;

class TaskService
{
    public function __construct(private TaskRepository $taskRepository) {}

    public function getAllTasks()
    {
        $organizationId = auth()->user()->organization_id;
        return $this->taskRepository->findByOrganization($organizationId);
    }

    public function createTask(array $data)
    {
        $data['organization_id'] = auth()->user()->organization_id;
        return $this->taskRepository->create($data);
    }

    public function getTask($id)
    {
        $task = $this->taskRepository->find($id);
        $this->authorizeOrganization($task);
        return $task;
    }

    public function updateTask($id, array $data)
    {
        $task = $this->taskRepository->find($id);
        $this->authorizeOrganization($task);
        return $this->taskRepository->update($task, $data);
    }

    public function deleteTask($id)
    {
        $task = $this->taskRepository->find($id);
        $this->authorizeOrganization($task);
        $this->taskRepository->delete($task);
    }

    public function updateStatus($id, array $data)
    {
        $task = $this->taskRepository->find($id);
        $this->authorizeOrganization($task);
        return $this->taskRepository->update($task, $data);
    }

    private function authorizeOrganization($task)
    {
        if ($task->organization_id !== auth()->user()->organization_id) {
            throw new AuthorizationException('Unauthorized');
        }
    }
}
