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
        Schema::create('residents', function (Blueprint $table) {
            $table->id();
            $table->string('nik', 16)->unique();
            $table->string('no_kk', 16);
            $table->string('name');
            $table->string('birth_place');
            $table->date('birth_date');
            $table->enum('gender', ['Laki-laki', 'Perempuan']);
            $table->string('religion');
            $table->string('marital_status');
            $table->string('occupation');
            $table->text('address');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['nik', 'is_active'], 'residents_index');

            $table->fullText(['no_kk', 'name', 'birth_place', 'religion', 'marital_status', 'occupation', 'address'], 'residents_fulltext_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residents');
    }
};
