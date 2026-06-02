<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\TypeService;
use App\Models\User;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DashboardController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('permission:r-dashboards', only: ['index', 'show']),
            new Middleware('permission:c-dashboards', only: ['create', 'store']),
            new Middleware('permission:u-dashboards', only: ['edit', 'update']),
            new Middleware('permission:d-dashboards', only: ['destroy', 'bulkDelete']),
        ];
    }

    /**
     * Display a listing of the resource.
     *
     * Admin Sistem melihat control-center dashboard; role lain mendapat placeholder.
     * Setiap query statistik dioptimalkan agar hanya melakukan satu round-trip per entitas.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = auth()->user();

        // Role admin mendapat dashboard khusus dengan statistik sistem lengkap.
        if ($user->hasRole('admin')) {
            return $this->adminDashboard();
        }

        // Fallback placeholder untuk role lain yang belum memiliki dashboard khusus.
        return Inertia::render('dashboard');
    }

    /**
     * Dashboard khusus Admin Sistem.
     *
     * Mengumpulkan seluruh statistik dalam query agregat tunggal per entitas
     * agar jumlah query ke database tetap minimal.
     */
    private function adminDashboard(): Response
    {
        // 1. Statistik ringkasan utama — satu query per tabel, menggunakan selectRaw
        //    untuk menghitung total dan total aktif dalam satu round-trip.
        $menuStats = Menu::selectRaw('COUNT(*) as total, SUM(CASE WHEN status = "enabled" THEN 1 ELSE 0 END) as active')
            ->first();

        $serviceStats = TypeService::selectRaw('COUNT(*) as total_services, SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_services')
            ->first();

        $stats = [
            'total_users' => User::count(),
            'total_roles' => Role::count(),
            'total_permissions' => Permission::count(),
            'total_menus' => (int) $menuStats->total,
            'total_active_menus' => (int) $menuStats->active,
            'total_type_services' => (int) $serviceStats->total_services,
            'total_active_type_services' => (int) $serviceStats->active_services,
        ];

        // 2. Distribusi user per role — satu query join untuk grafik donut.
        $usersByRole = DB::table('model_has_roles')
            ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
            ->select('roles.name as role', DB::raw('COUNT(*) as count'))
            ->groupBy('roles.name')
            ->orderByDesc('count')
            ->get();

        // 3. Pengguna online — dari session aktif dalam 5 menit terakhir.
        $onlineUsers = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', now()->subMinutes(5)->timestamp)
            ->distinct('user_id')
            ->count('user_id');

        // 4. Aktivitas sistem per modul — menghitung item per modul untuk bar chart.
        $moduleCounts = [
            ['module' => 'Kelola Pengguna', 'count' => $stats['total_users']],
            ['module' => 'Kelola Peran', 'count' => $stats['total_roles']],
            ['module' => 'Kelola Hak Akses', 'count' => $stats['total_permissions']],
            ['module' => 'Kelola Menu', 'count' => $stats['total_menus']],
            ['module' => 'Jenis Layanan', 'count' => $stats['total_type_services']],
        ];

        // 5. Status modul sistem — cek apakah setiap modul sudah terkonfigurasi.
        $rolesWithoutPermission = Role::whereDoesntHave('permissions')->count();
        $menusWithoutPermission = Menu::where('permission', '')->orWhereNull('permission')->count();

        $moduleStatus = [
            ['name' => 'Kelola Pengguna', 'status' => $stats['total_users'] > 0 ? 'Aktif' : 'Perlu Cek'],
            ['name' => 'Kelola Peran', 'status' => $stats['total_roles'] > 0 ? 'Aktif' : 'Perlu Cek'],
            ['name' => 'Kelola Hak Akses', 'status' => $stats['total_permissions'] > 0 ? 'Aktif' : 'Perlu Cek'],
            ['name' => 'Kelola Menu', 'status' => $stats['total_active_menus'] > 0 ? 'Aktif' : 'Perlu Cek'],
            ['name' => 'Jenis Layanan', 'status' => $stats['total_active_type_services'] > 0 ? 'Aktif' : 'Perlu Cek'],
            ['name' => 'Template Surat', 'status' => 'Perlu Cek'],
        ];

        $securityStats = [
            'roles_without_permission' => $rolesWithoutPermission,
            'menus_without_permission' => $menusWithoutPermission,
        ];

        // 6. Lima user terbaru — eager load roles agar tidak N+1.
        $recentUsers = User::with('roles:id,name')
            ->select('id', 'name', 'email', 'created_at')
            ->latest()
            ->limit(5)
            ->get();

        // 7. Info sistem — versi PHP, Laravel, dan waktu server.
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'server_time' => now()->toDateTimeString(),
            'timezone' => config('app.timezone'),
        ];

        return Inertia::render('admins/dashboard', [
            'stats' => $stats,
            'usersByRole' => $usersByRole,
            'onlineUsers' => $onlineUsers,
            'moduleCounts' => $moduleCounts,
            'moduleStatus' => $moduleStatus,
            'securityStats' => $securityStats,
            'recentUsers' => $recentUsers,
            'systemInfo' => $systemInfo,
        ]);
    }
}
