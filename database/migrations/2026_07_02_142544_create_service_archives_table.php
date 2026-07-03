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
        Schema::create('service_archives', function (Blueprint $table) {
            $table->id();
            $table->string('archive_number', 50)->unique();
            $table->foreignId('service_id')->unique()->constrained('services')->onDelete('cascade');
            $table->enum('status', ['aktif', 'ditutup', 'retensi'])->default('aktif');
            $table->timestamp('archived_at')->nullable();
            $table->foreignId('archived_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_archives');
    }
};
