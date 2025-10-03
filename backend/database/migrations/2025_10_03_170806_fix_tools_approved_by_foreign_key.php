<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            // Drop the existing foreign key constraint
            $table->dropForeign(['approved_by']);

            // Update the foreign key to reference admins table instead of users table
            $table->foreign('approved_by')->references('id')->on('admins')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tools', function (Blueprint $table) {
            // Drop the foreign key to admins
            $table->dropForeign(['approved_by']);

            // Restore the original foreign key to users table
            $table->foreign('approved_by')->references('id')->on('users')->onDelete('set null');
        });
    }
};
