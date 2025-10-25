<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\User;
use App\Repositories\AuthRepository;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Support\Facades\Hash;

class AuthService
{
    public function __construct(private AuthRepository $authRepository) {}

    public function register(array $data): array
    {
        $organization = $this->authRepository->createOrganization(['name' => $data['organization_name']]);
        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'organization_id' => $organization->id,
        ];
        $user = $this->authRepository->createUser($userData);
        $token = $user->createToken('auth_token')->plainTextToken;
        return [$user, $token];
    }

    public function login(array $data): array
    {
        $user = $this->authRepository->findUserByEmail($data['email']);
        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw new AuthenticationException('Invalid credentials');
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        return [$user, $token];
    }

    public function logout(): void
    {
        auth()->user()->tokens()->delete();
    }
}
