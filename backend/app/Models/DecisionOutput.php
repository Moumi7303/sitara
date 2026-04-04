<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecisionOutput extends Model
{
    use HasFactory;

    protected $fillable = [
        'decision_id', 'recommendation',
        'key_factors', 'pros', 'cons', 'risks', 'alternatives'
    ];

    protected $casts = [
        'key_factors' => 'array',
        'pros' => 'array',
        'cons' => 'array',
        'risks' => 'array',
        'alternatives' => 'array',
    ];

    public function decision()
    {
        return $this->belongsTo(Decision::class);
    }
}
