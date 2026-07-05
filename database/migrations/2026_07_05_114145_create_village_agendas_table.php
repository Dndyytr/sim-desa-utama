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
        Schema::create('village_agendas', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('category'); // e.g. kegiatan, rapat, musyawarah, pelayanan_keliling, sosialisasi, pembangunan, lain_lain
            $table->date('start_date');
            $table->date('end_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('location');
            $table->text('address')->nullable();
            $table->string('poster')->nullable();
            $table->string('attachment')->nullable();
            $table->enum('status', ['draft', 'published', 'unpublished', 'completed'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();

            // Indexes for query optimization
            $table->index('title'); // For search optimizations with trailing wildcard
            $table->index('category');
            $table->index('status');
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('village_agendas');
    }
};
