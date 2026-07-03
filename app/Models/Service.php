<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'service_number',
    'submission_id',
    'status',
    'assigned_to',
    'notes',
    'result',
    'draft_content',
])]
class Service extends Model
{
    /**
     * Get the submission that this service was created from.
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class, 'submission_id');
    }

    /**
     * Get the user who is assigned to this service.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the letter generated for this service.
     */
    public function letter(): HasOne
    {
        return $this->hasOne(Letter::class, 'service_id');
    }

    /**
     * Get the archive record for this service.
     */
    public function archive(): HasOne
    {
        return $this->hasOne(ServiceArchive::class, 'service_id');
    }
}
