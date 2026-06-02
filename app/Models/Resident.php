<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Resident extends Model
{
    protected $fillable = [
        'nik',
        'no_kk',
        'name',
        'birth_place',
        'birth_date',
        'gender',
        'religion',
        'marital_status',
        'occupation',
        'address',
        'is_active',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'is_active' => 'boolean',
    ];
}
