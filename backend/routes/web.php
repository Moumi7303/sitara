<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->file(public_path('index.html'));
});

// Fallback for SPA: Route any unknown path to frontend entry (ignoring /api)
Route::get('/{any}', function () {
    return response()->file(public_path('index.html'));
})->where('any', '^(?!api).*$');
