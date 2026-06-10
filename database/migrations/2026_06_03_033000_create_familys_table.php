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
        Schema::create('familys', function (Blueprint $table) {
            $table->id();
            $table->string('no_kk', 16)->unique();
            $table->foreignId('head_resident_id')->nullable()->unique()->constrained('residents')->onDelete('set null');
            $table->text('address')->nullable();
            $table->string('rt', 5)->nullable();
            $table->string('rw', 5)->nullable();
            $table->string('hamlet')->nullable();
            $table->boolean('status')->default(true);
            $table->timestamps();

            $table->index(['no_kk', 'status'], 'familys_index');
            $table->fullText(['no_kk', 'address', 'hamlet'], 'familys_fulltext_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('familys');
    }
};
