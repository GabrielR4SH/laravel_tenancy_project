<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Organization;
use App\Models\Task;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_create_task_assigns_organization()
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $org->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer $token"])->postJson('/api/tasks', [
            'title' => 'Nova Tarefa',
            'description' => 'Descrição',
            'priority' => 'medium', // Adicionado conforme StoreTaskRequest
            'due_date' => null,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tasks', [
            'title' => 'Nova Tarefa',
            'organization_id' => $org->id,
        ]);
    }

    public function test_update_task()
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $org->id]);
        $task = Task::factory()->create(['organization_id' => $org->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer $token"])->putJson("/api/tasks/{$task->id}", [
            'title' => 'Tarefa Atualizada',
            'description' => 'Nova Descrição',
            'priority' => 'high',
            'due_date' => null,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Tarefa Atualizada',
        ]);
    }

    public function test_delete_task()
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $org->id]);
        $task = Task::factory()->create(['organization_id' => $org->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer $token"])->deleteJson("/api/tasks/{$task->id}");
        $response->assertStatus(204); // Ajustado para 204 conforme TaskController
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_update_task_status()
    {
        $org = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $org->id]);
        $task = Task::factory()->create(['organization_id' => $org->id, 'status' => 'pending']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer $token"])->patchJson("/api/tasks/{$task->id}/status", [
            'status' => 'in_progress',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'status' => 'in_progress',
        ]);
    }
}
