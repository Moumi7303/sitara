<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Decision extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'domain', 'query', 'status', 'confidence_score'];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'confidence_score' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function output()
    {
        return $this->hasOne(DecisionOutput::class);
    }
}
