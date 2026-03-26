<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApiKey extends Model
{
    protected $fillable = ['user_id', 'provider', 'encrypted_key', 'status', 'last_used_at'];
    
    protected $hidden = ['encrypted_key'];

    protected $casts = [
        'status' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
