<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Success response.
     */
    protected function success($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => $message,
        ], $code);
    }

    /**
     * Error response.
     */
    protected function error(string $message, int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'error' => [
                'message' => $message,
            ],
        ];

        if ($errors !== null) {
            $response['error']['details'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Paginated success response.
     */
    protected function paginated($paginator, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $paginator->items(),
            'message' => $message,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ],
        ]);
    }
}
