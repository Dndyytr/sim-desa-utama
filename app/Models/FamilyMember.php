<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'family_id',
    'resident_id',
    'relationship',
    'is_head',
    'status_member',
])]
class FamilyMember extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'family_members';

    /**
     * Get the family.
     */
    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class, 'family_id');
    }

    /**
     * Get the resident.
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }
}
