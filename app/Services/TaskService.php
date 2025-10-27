<?php

namespace App\Services;

use App\Repositories\TaskRepository;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TaskService
{
    public function __construct(private TaskRepository $taskRepository) {}

    public function getAllTasks()
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            Log::error('Usuário não autenticado em getAllTasks');
            throw new AuthorizationException('Usuário não autenticado.');
        }
        Log::info('Usuário autenticado', ['user_id' => $user->id, 'organization_id' => $user->organization_id]);
        $organizationId = $user->organization_id;
        return $this->taskRepository->findByOrganization($organizationId);
    }

 public function createTask(array $data)
{
    $user = Auth::guard('sanctum')->user();
    if (!$user) {
        Log::error('Usuário não autenticado em createTask', ['token' => request()->header('Authorization')]);
        throw new AuthorizationException('Usuário não autenticado.');
    }

    if (!$user->organization_id) {
        Log::error('Usuário sem organization_id', ['user_id' => $user->id]);
        throw new AuthorizationException('Usuário sem organização associada.');
    }

    Log::info('Criando task para usuário', ['user_id' => $user->id, 'organization_id' => $user->organization_id, 'data' => $data]);

    $data['organization_id'] = $user->organization_id;
    $task = $this->taskRepository->create($data);

    Log::info('Task criada com sucesso', ['task_id' => $task->id, 'organization_id' => $task->organization_id]);

    return $task;
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
        $user = Auth::guard('sanctum')->user();
        if (!$user || $task->organization_id !== $user->organization_id) {
            Log::error('Autorização falhou', ['task_organization_id' => $task->organization_id, 'user_organization_id' => $user->organization_id ?? 'null', 'token' => request()->header('Authorization')]);
            throw new AuthorizationException('Unauthorized');
        }
        Log::info('Autorização bem-sucedida', ['task_organization_id' => $task->organization_id, 'user_organization_id' => $user->organization_id]);
    }
}
