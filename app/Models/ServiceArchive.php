<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'archive_number',
    'service_id',
    'status',
    'archived_at',
    'archived_by',
])]
class ServiceArchive extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    /**
     * Get the service related to this archive.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    /**
     * Get the user who archived this service.
     */
    public function archivist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'archived_by');
    }
}
