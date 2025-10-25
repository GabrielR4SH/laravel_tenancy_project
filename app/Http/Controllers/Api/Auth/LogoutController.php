<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function __invoke(): JsonResponse
    {
        $this->authService->logout();
        return response()->json(['message' => 'Logged out']);
    }
}
