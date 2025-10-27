<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrganizationController extends Controller
{
    public function theme()
    {
        $user = Auth::guard('sanctum')->user();
        if (!$user || !$user->organization) {
            return response()->json(['error' => 'Organização não encontrada'], 404);
        }

        return response()->json($user->organization);
    }

    public function index()
    {
        // Assuming organizations are public for selection during register
        return Organization::select('id', 'name')->get();
    }
}
