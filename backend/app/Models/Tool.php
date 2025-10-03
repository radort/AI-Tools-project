<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Permission\Models\Role;

class Tool extends Model
{
    use LogsActivity;
    protected $fillable = [
        'name',
        'description',
        'url',
        'docs_url',
        'video_url',
        'difficulty',
        'created_by',
        'status',
        'rejection_reason',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'difficulty' => 'string',
        'status' => 'string',
        'approved_at' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'tool_category', 'tool_id', 'category_id');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'tool_role', 'tool_id', 'role_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ToolComment::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(ToolRating::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name', 'description', 'url', 'docs_url', 'video_url',
                'difficulty', 'status', 'rejection_reason', 'approved_by'
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
}
