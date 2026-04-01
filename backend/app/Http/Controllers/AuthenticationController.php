<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\RegisterRequest;
use App\Models\AuditLog;
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
            ]);

            AuditLog::create([
                'user_id' => $user->id,
                'action' => 'user_registration',
                'status' => 'success',
                'metadata' => ['email' => $user->email]
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
            AuditLog::create([
                'user_id' => $user?->id,
                'action' => 'user_login',
                'status' => 'failure',
                'metadata' => ['email' => $validated['email'], 'reason' => 'invalid_credentials']
            ]);

            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        AuditLog::create([
            'user_id' => $user->id,
            'action' => 'user_login',
            'status' => 'success',
            'metadata' => ['email' => $user->email]
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
}
