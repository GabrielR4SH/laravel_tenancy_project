<?php

namespace App\Repositories;

use App\Models\Organization;
use App\Models\User;

class AuthRepository
{
    public function createOrganization(array $data): Organization
    {
        return Organization::create($data);
    }

    public function createUser(array $data): User
    {
        return User::create($data);
    }

    public function findUserByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }
}
