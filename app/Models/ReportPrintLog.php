<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'report_type',
    'period',
    'start_date',
    'end_date',
    'filters',
])]
class ReportPrintLog extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'filters' => 'array',
        ];
    }

    /**
     * Get the user who printed this report.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
