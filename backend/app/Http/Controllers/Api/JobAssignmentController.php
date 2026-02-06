<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobAssignment;
use App\Models\RecruitmentJob;
use App\Services\JobAssignmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobAssignmentController extends Controller
{
    public function __construct(
        private JobAssignmentService $jobAssignmentService
    ) {
    }

    /**
     * Giao việc cho nhân viên
     */
    public function assign(Request $request, RecruitmentJob $job): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'target_assigned' => 'nullable|integer|min:1',
        ]);

        try {
            $assignment = $this->jobAssignmentService->assignJobToUser(
                $job,
                $validated['user_id'],
                $validated['target_assigned'] ?? null,
                Auth::user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Đã giao việc thành công',
                'data' => $assignment->load('user'),
            ]);
        } catch (\Exception $e) {
            $code = $e->getCode() ?: 400;
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], $code);
        }
    }

    /**
     * Lấy danh sách assignments của job
     */
    public function index(RecruitmentJob $job): JsonResponse
    {
        $result = $this->jobAssignmentService->getAssignments($job);

        return response()->json([
            'success' => true,
            'data' => $result['assignments'],
            'summary' => $result['summary'],
        ]);
    }

    /**
     * Nhân viên cập nhật tiến độ
     */
    public function updateProgress(Request $request, JobAssignment $assignment): JsonResponse
    {
        $validated = $request->validate([
            'found_count' => 'required|integer|min:0',
            'confirmed_count' => 'nullable|integer|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $assignment = $this->jobAssignmentService->updateProgress(
                $assignment,
                $validated,
                Auth::user()
            );

            return response()->json([
                'success' => true,
                'message' => 'Đã cập nhật tiến độ',
                'data' => $assignment,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }

    /**
     * Lấy danh sách jobs được giao cho user hiện tại
     */
    public function myAssignments(): JsonResponse
    {
        $assignments = $this->jobAssignmentService->getMyAssignments(Auth::id());

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
        try {
            $this->jobAssignmentService->deleteAssignment($assignment, Auth::user());

            return response()->json([
                'success' => true,
                'message' => 'Đã hủy giao việc',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], $e->getCode() ?: 403);
        }
    }
}
