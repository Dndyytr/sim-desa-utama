<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function divideUp(): void
    {
        // Not used, using up()
    }

    public function up(): void
    {
        Schema::create('service_logs', function (Blueprint $blueprint) {
            $blueprint->id();
            $blueprint->foreignId('submission_id')->constrained('submissions')->cascadeOnDelete();
            $blueprint->string('stage');
            $blueprint->string('activity');
            $blueprint->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $blueprint->text('notes')->nullable();
            $blueprint->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_logs');
    }
};
