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
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->string('submission_number', 30)->unique();
            $table->foreignId('resident_id')->constrained('residents')->onDelete('cascade');
            $table->foreignId('type_service_id')->constrained('type_services')->onDelete('cascade');
            $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('subject');
            $table->text('description')->nullable();
            $table->string('status')->default('pending'); // pending, verified, rejected
            $table->string('source')->default('offline'); // offline, mobile, website
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['submission_number', 'status'], 'submissions_index');
            $table->fullText(['submission_number', 'subject'], 'submissions_fulltext_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
