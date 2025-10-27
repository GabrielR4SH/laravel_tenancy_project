<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Models\User;
use App\Models\Organization;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\JsonResponse;

class RegisterController extends Controller
{
    public function __invoke(RegisterRequest $request): JsonResponse
    {
        try {
            if ($request->filled('organization_name')) {
                // Create or find organization by name
                $organization = Organization::firstOrCreate(
                    ['name' => $request->organization_name],
                    [
                        'primary_color' => '#FF0000',
                        'secondary_color' => '#000000',
                        'theme_style' => 'dark',
                    ]
                );
            } elseif ($request->filled('organization_id')) {
                // Use existing organization
                $organization = Organization::findOrFail($request->organization_id);
            } else {
                // This shouldn't happen due to validation, but fallback
                return response()->json(['error' => 'Forneça o nome ou ID da organização.'], 422);
            }

            // Create user
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'organization_id' => $organization->id,
            ]);

            // Generate token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json(['user' => $user, 'token' => $token], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Erro ao registrar usuário: ' . $e->getMessage()], 500);
        }
    }
}
