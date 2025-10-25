<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $fillable = ['organization_id', 'title', 'description', 'status', 'priority', 'due_date'];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
