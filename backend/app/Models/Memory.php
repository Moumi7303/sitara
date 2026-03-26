<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Memory extends Model
{
    /**
     * The table associated with the model.
     * Updated to match the restructured database schema.
     *
     * @var string
     */
    protected $table = 'memory';

    protected $fillable = ['user_id', 'context'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
