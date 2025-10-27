<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse
    {
        Log::info('LoginController chamado', $request->validated());

        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            Log::error('Credenciais inválidas', $data);
            return response()->json(['error' => 'Credenciais inválidas.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Usuário logado e token gerado', ['user_id' => $user->id, 'token' => $token]);

        return response()->json(['user' => $user, 'token' => $token]);
    }
}
