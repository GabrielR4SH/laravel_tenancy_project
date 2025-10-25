<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // // Manually register API routes
        // Route::prefix('api')
        //     ->middleware('api')
        //     ->namespace($this->app->getNamespace())
        //     ->group(base_path('routes/api.php'));
    }
}
