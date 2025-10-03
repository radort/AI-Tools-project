<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    public function tools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class, 'tool_category', 'category_id', 'tool_id');
    }
}
