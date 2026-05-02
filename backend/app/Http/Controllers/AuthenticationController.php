<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\RegisterRequest;
use App\Services\AuditService;
use Illuminate\Support\Facades\DB;

class AuthenticationController extends Controller
{
    public function register(RegisterRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => User::ROLE_USER,
            ]);

            AuditService::log($user->id, 'user_registration', 'success', [
                'email' => $user->email,
            ]);

            return response()->json([
                'message' => 'User registered successfully',
                'token' => $user->createToken('auth_token')->plainTextToken,
                'user' => $user
            ], 201);
        });
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            AuditService::log($user?->id, 'user_login', 'failure', [
                'email' => $validated['email'],
                'reason' => 'invalid_credentials',
            ]);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        AuditService::log($user->id, 'user_login', 'success', [
            'email' => $user->email,
        ]);

        return response()->json([
            'token' => $user->createToken('auth_token')->plainTextToken,
            'user' => $user
        ]);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Viewers cannot update their profile
        if ($user->isViewer()) {
            return response()->json(['error' => 'Viewers cannot modify profile data.'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        AuditService::log($user->id, 'user_profile_update', 'success', [
            'email' => $user->email,
            'name' => $user->name,
        ]);

        return response()->json($user);
    }
}
