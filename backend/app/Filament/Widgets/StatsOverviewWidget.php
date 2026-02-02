<?php

namespace App\Filament\Widgets;

use App\Models\Candidate;
use App\Models\Conversation;
use App\Models\JobApplication;
use App\Models\RecruitmentJob;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Carbon;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $today = Carbon::today();
        $thisWeek = Carbon::now()->startOfWeek();
        $thisMonth = Carbon::now()->startOfMonth();

        // Calculate trends
        $lastMonthCandidates = Candidate::where('created_at', '<', $thisMonth)
            ->where('created_at', '>=', $thisMonth->copy()->subMonth())
            ->count();
        $thisMonthCandidates = Candidate::where('created_at', '>=', $thisMonth)->count();
        $candidateTrend = $lastMonthCandidates > 0
            ? round((($thisMonthCandidates - $lastMonthCandidates) / $lastMonthCandidates) * 100, 1)
            : 100;

        $lastMonthApps = JobApplication::where('created_at', '<', $thisMonth)
            ->where('created_at', '>=', $thisMonth->copy()->subMonth())
            ->count();
        $thisMonthApps = JobApplication::where('created_at', '>=', $thisMonth)->count();
        $appTrend = $lastMonthApps > 0
            ? round((($thisMonthApps - $lastMonthApps) / $lastMonthApps) * 100, 1)
            : 100;

        return [
            Stat::make('Tin tuyển dụng đang mở', RecruitmentJob::where('status', 'open')->count())
                ->description(RecruitmentJob::count() . ' tổng tin')
                ->descriptionIcon('heroicon-m-briefcase')
                ->chart([7, 3, 4, 5, 6, 3, 5, 3])
                ->color('primary'),

            Stat::make('Tổng ứng viên', Candidate::count())
                ->description(($candidateTrend >= 0 ? '+' : '') . $candidateTrend . '% so với tháng trước')
                ->descriptionIcon($candidateTrend >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->chart([3, 5, 7, 6, 8, 9, 11, $thisMonthCandidates])
                ->color($candidateTrend >= 0 ? 'success' : 'danger'),

            Stat::make('Đơn ứng tuyển tháng này', $thisMonthApps)
                ->description(($appTrend >= 0 ? '+' : '') . $appTrend . '% so với tháng trước')
                ->descriptionIcon($appTrend >= 0 ? 'heroicon-m-arrow-trending-up' : 'heroicon-m-arrow-trending-down')
                ->chart([5, 7, 3, 8, 6, 9, 7, $thisMonthApps])
                ->color('warning'),

            Stat::make('Chờ phỏng vấn', JobApplication::whereNotNull('interview_scheduled_at')
                ->whereNull('hired_at')
                ->where('interview_scheduled_at', '>=', $today)
                ->count())
                ->description('Lịch phỏng vấn sắp tới')
                ->descriptionIcon('heroicon-m-calendar')
                ->color('info'),

            Stat::make('Đã tuyển tháng này', JobApplication::whereNotNull('hired_at')
                ->where('hired_at', '>=', $thisMonth)
                ->count())
                ->description('Ứng viên trúng tuyển')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success'),

            Stat::make('Nhân viên', User::count())
                ->description('Người dùng hệ thống')
                ->descriptionIcon('heroicon-m-user-group')
                ->color('gray'),
        ];
    }
}
