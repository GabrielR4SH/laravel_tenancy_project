<?php

namespace Database\Seeders;

use App\Models\Organization;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrganizationSeeder extends Seeder
{
    public function run(): void
    {
        // Org A
        $orgA = Organization::create([
            'name' => 'Org A',
            'primary_color' => '#FF0000', // red
            'secondary_color' => '#000000', // black
            'theme_style' => 'dark',
        ]);
        $userA = User::create([
            'name' => 'User A',
            'email' => 'user1@org1.com',
            'password' => Hash::make('password'),
            'organization_id' => $orgA->id,
        ]);
        for ($i = 1; $i <= 5; $i++) {
            Task::create([
                'organization_id' => $orgA->id,
                'title' => "Task $i for Org A",
                'description' => "Description $i",
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays($i),
            ]);
        }

        // Org B
        $orgB = Organization::create([
            'name' => 'Org B',
            'primary_color' => '#00FF00', // green
            'secondary_color' => '#FFFFFF', // white
            'theme_style' => 'light',
        ]);
        $userB = User::create([
            'name' => 'User B',
            'email' => 'user2@org2.com',
            'password' => Hash::make('password'),
            'organization_id' => $orgB->id,
        ]);
        for ($i = 1; $i <= 5; $i++) {
            Task::create([
                'organization_id' => $orgB->id,
                'title' => "Task $i for Org B",
                'description' => "Description $i",
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays($i),
            ]);
        }
    }
}
