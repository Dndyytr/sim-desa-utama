<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
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
])]
class Resident extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'is_active' => 'boolean',
        ];
    }

    public function family()
    {
        return $this->hasOne(Family::class, 'head_resident_id', 'id');
    }

    public function familyMembers()
    {
        return $this->hasMany(FamilyMember::class, 'resident_id');
    }
}
