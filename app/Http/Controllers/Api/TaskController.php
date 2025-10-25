<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\UpdateTaskStatusRequest;
use App\Http\Resources\TaskResource;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;

class TaskController extends Controller
{
    public function __construct(private TaskService $taskService) {}

    public function index(): JsonResponse
    {
        $tasks = $this->taskService->getAllTasks();
        return response()->json(TaskResource::collection($tasks));
    }

    public function store(StoreTaskRequest $request): JsonResponse
    {
        $task = $this->taskService->createTask($request->validated());
        return response()->json(new TaskResource($task), 201);
    }

    public function show($id): JsonResponse
    {
        $task = $this->taskService->getTask($id);
        return response()->json(new TaskResource($task));
    }

    public function update(UpdateTaskRequest $request, $id): JsonResponse
    {
        $task = $this->taskService->updateTask($id, $request->validated());
        return response()->json(new TaskResource($task));
    }

    public function destroy($id): JsonResponse
    {
        $this->taskService->deleteTask($id);
        return response()->json(null, 204);
    }

    public function updateStatus(UpdateTaskStatusRequest $request, $id): JsonResponse
    {
        $task = $this->taskService->updateStatus($id, $request->validated());
        return response()->json(new TaskResource($task));
    }
}
