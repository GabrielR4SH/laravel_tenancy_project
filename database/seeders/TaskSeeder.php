<?php

namespace Database\Seeders;

use App\Models\Task;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        // Exemplo de tarefas adicionais (pode ajustar as organizations_ids conforme necessário)
        $tasks = [
            [
                'organization_id' => 1, // Org A
                'title' => 'Tarefa Extra 1',
                'description' => 'Descrição extra 1',
                'status' => 'pending',
                'priority' => 'high',
                'due_date' => now()->addDays(7),
            ],
            [
                'organization_id' => 2, // Org B
                'title' => 'Tarefa Extra 2',
                'description' => 'Descrição extra 2',
                'status' => 'in_progress',
                'priority' => 'low',
                'due_date' => now()->addDays(10),
            ],
            [
                'organization_id' => 3, // Org C
                'title' => 'Tarefa Extra 3',
                'description' => 'Descrição extra 3',
                'status' => 'done',
                'priority' => 'medium',
                'due_date' => now()->addDays(5),
            ],
        ];

        foreach ($tasks as $task) {
            Task::create($task);
        }
    }
}
