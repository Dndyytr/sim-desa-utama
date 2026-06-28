<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'submission_number',
    'resident_id',
    'type_service_id',
    'submitted_by',
    'subject',
    'description',
    'status',
    'source',
    'notes',
])]
class Submission extends Model
{
    /**
     * Get the resident who made the submission.
     */
    public function resident(): BelongsTo
    {
        return $this->belongsTo(Resident::class, 'resident_id');
    }

    /**
     * Get the service type of the submission.
     */
    public function typeService(): BelongsTo
    {
        return $this->belongsTo(TypeService::class, 'type_service_id');
    }

    /**
     * Get the user/officer who logged the submission.
     */
    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    /**
     * Get the attachments for the submission.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(SubmissionAttachment::class, 'submission_id');
    }

    /**
     * Get the service logs for the submission.
     */
    public function serviceLogs(): HasMany
    {
        return $this->hasMany(ServiceLog::class, 'submission_id')->orderBy('created_at', 'desc');
    }

    /**
     * Get the service record associated with the submission.
     */
    public function service(): HasOne
    {
        return $this->hasOne(Service::class, 'submission_id');
    }
}
