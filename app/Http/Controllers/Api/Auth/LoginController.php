<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    public function __invoke(LoginRequest $request)
    {
        Log::info('LoginController chamado', $request->validated()); // Debug no backend

        $data = $request->validated();
        if (!Auth::attempt($data)) {
            Log::error('Credenciais inválidas', $data);
            return back()->withErrors(['email' => 'Credenciais inválidas.']);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        Log::info('Usuário logado e token gerado', ['user_id' => $user->id, 'token' => $token]); // Debug no backend

        // Renderiza o Dashboard diretamente com o token como prop
        return Inertia::render('Dashboard', [
            'token' => $token,
            'auth' => ['user' => $user], // Passa o usuário autenticado
        ]);
    }
}
