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
        Schema::table('menus', function (Blueprint $table) {
            $table->index(['parent_id', 'status'], 'menus_parent_id_status_index');

            $table->fullText(['title', 'icon', 'url', 'tag', 'permission'], 'menus_fulltext_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menus', function (Blueprint $table) {
            $table->dropIndex('menus_parent_id_status_index');
            $table->dropIndex('menus_fulltext_index');
        });
    }
};
