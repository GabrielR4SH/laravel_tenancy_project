<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    public function __invoke(LoginRequest $request)
    {
        console.log('LoginController chamado'); // Debug no backend (se habilitado)
        [$user, $token] = $this->authService->login($request->validated());
        console.log('Usuário logado e token gerado:', ['user' => $user, 'token' => $token]); // Debug no backend
        return Inertia::location('/dashboard')
            ->with(['token' => $token]); // Passa o token para o frontend
    }
}
