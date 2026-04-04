<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Memory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     * Updated to match the restructured database schema.
     *
     * @var string
     */
    protected $table = 'memory';

    protected $fillable = ['user_id', 'type', 'content'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
