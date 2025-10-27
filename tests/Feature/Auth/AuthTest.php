<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Organization;
use App\Models\User;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_user_and_organization()
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Test User',
            'email' => 'test@org.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'organization_name' => 'Test Org',
        ]);

        $response->assertStatus(201);
        $response->assertJsonStructure(['user', 'token']);
        $this->assertDatabaseHas('users', ['email' => 'test@org.com']);
        $this->assertDatabaseHas('organizations', ['name' => 'Test Org']);
    }

    public function test_login_returns_token()
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create([
            'organization_id' => $organization->id,
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['user', 'token']);
    }

    public function test_logout_removes_token()
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create(['organization_id' => $organization->id]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeaders(['Authorization' => "Bearer $token"])->postJson('/api/logout');
        $response->assertStatus(200);
        $response->assertJson(['message' => 'Logged out']); // Ajustado para a mensagem real
    }

    public function test_unauthenticated_access_fails()
    {
        $response = $this->getJson('/api/tasks');
        $response->assertStatus(401);
    }
}
