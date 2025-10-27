<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\OrganizationController;

// Public routes
Route::post('/register', RegisterController::class);
Route::post('/login', [LoginController::class, '__invoke']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', LogoutController::class);
    Route::apiResource('/tasks', TaskController::class);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
    Route::get('/organization/theme', [OrganizationController::class, 'theme']);
});

Route::get('/organizations', [OrganizationController::class, 'index']); // Public for register
