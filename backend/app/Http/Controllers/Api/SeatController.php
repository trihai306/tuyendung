<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SeatService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SeatController extends Controller
{
    public function __construct(
        private SeatService $seatService
    ) {
    }

    /**
     * Get seat pricing info
     */
    public function getPricing(): JsonResponse
    {
        $pricing = $this->seatService->getPricing();

        return response()->json([
            'success' => true,
            'data' => $pricing,
        ]);
    }

    /**
     * Get company's current seat info
     */
    public function getCompanySeats(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $data = $this->seatService->getCompanySeats($companyId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Purchase seats
     */
    public function purchaseSeats(Request $request): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:1|max:100',
        ]);

        try {
            $companyId = $request->user()->company_id;
            $result = $this->seatService->purchaseSeats($companyId, $request->quantity);

            return response()->json([
                'success' => true,
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Assign user to a seat
     */
    public function assignSeat(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $result = $this->seatService->assignSeat(
                $request->user()->company_id,
                $request->user_id,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'remaining_seats' => $result['remaining_seats'],
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra.',
            ], 500);
        }
    }

    /**
     * Unassign user from seat
     */
    public function unassignSeat(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        try {
            $result = $this->seatService->unassignSeat(
                $request->user()->company_id,
                $request->user_id
            );

            return response()->json([
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'available_seats' => $result['available_seats'],
                ],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra.',
            ], 500);
        }
    }
}
