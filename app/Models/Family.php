<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'no_kk',
    'head_resident_id',
    'address',
    'rt',
    'rw',
    'hamlet',
    'status',
])]
class Family extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'familys';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => 'boolean',
        ];
    }

    /**
     * Get the head of the family.
     */
    public function headResident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'head_resident_id');
    }

    /**
     * Get the members of the family.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Resident::class, 'family_members', 'family_id', 'resident_id')
            ->withPivot(['relationship', 'is_head', 'status_member'])
            ->withTimestamps();
    }
}
