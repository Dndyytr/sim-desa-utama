<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'title',
    'slug',
    'description',
    'category',
    'start_date',
    'end_date',
    'start_time',
    'end_time',
    'location',
    'address',
    'poster',
    'attachment',
    'status',
    'published_at',
    'created_by',
])]
class VillageAgenda extends Model
{
    use SoftDeletes;

    protected $table = 'village_agendas';

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'published_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
