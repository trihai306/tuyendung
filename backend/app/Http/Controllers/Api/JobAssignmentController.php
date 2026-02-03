<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobAssignment;
use App\Models\RecruitmentJob;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobAssignmentController extends Controller
{
    /**
     * Giao việc cho nhân viên
     */
    public function assign(Request $request, RecruitmentJob $job): JsonResponse
    {
        $user = Auth::user();
        $company = $user->company;

        // Chỉ manager mới có quyền giao việc
        if (!$company || !in_array($user->role, ['owner', 'admin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'target_assigned' => 'nullable|integer|min:1',
        ]);

        // Kiểm tra user thuộc cùng company
        $assignee = User::find($validated['user_id']);
        if (!$assignee || $assignee->company_id !== $company->id) {
            return response()->json([
                'success' => false,
                'error' => 'Nhân viên không thuộc công ty của bạn',
            ], 400);
        }

        // Tạo hoặc update assignment
        $assignment = JobAssignment::updateOrCreate(
            ['job_id' => $job->id, 'user_id' => $validated['user_id']],
            [
                'target_assigned' => $validated['target_assigned'] ?? null,
                'status' => 'assigned',
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã giao việc thành công',
            'data' => $assignment->load('user'),
        ]);
    }

    /**
     * Lấy danh sách assignments của job
     */
    public function index(RecruitmentJob $job): JsonResponse
    {
        $assignments = $job->assignments()->with('user:id,name,email')->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
            'summary' => [
                'total_assigned' => $assignments->sum('target_assigned'),
                'total_found' => $assignments->sum('found_count'),
                'total_confirmed' => $assignments->sum('confirmed_count'),
                'target_count' => $job->target_count,
                'progress_percent' => $job->progress_percent,
            ],
        ]);
    }

    /**
     * Nhân viên cập nhật tiến độ
     */
    public function updateProgress(Request $request, JobAssignment $assignment): JsonResponse
    {
        $user = Auth::user();

        // Chỉ nhân viên được giao mới có thể cập nhật
        if ($assignment->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'found_count' => 'required|integer|min:0',
            'confirmed_count' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        $assignment->updateProgress(
            $validated['found_count'],
            $validated['confirmed_count'] ?? null,
            $validated['notes'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã cập nhật tiến độ',
            'data' => $assignment->fresh()->load('job'),
        ]);
    }

    /**
     * Lấy danh sách jobs được giao cho user hiện tại
     */
    public function myAssignments(): JsonResponse
    {
        $user = Auth::user();

        $assignments = JobAssignment::where('user_id', $user->id)
            ->with(['job:id,title,status,target_count,hired_count,expires_at'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $assignments,
        ]);
    }

    /**
     * Xóa assignment
     */
    public function destroy(JobAssignment $assignment): JsonResponse
    {
        $user = Auth::user();

        // Chỉ manager mới có quyền xóa
        if (!in_array($user->role, ['owner', 'admin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã hủy giao việc',
        ]);
    }
}
