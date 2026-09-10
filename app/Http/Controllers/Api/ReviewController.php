<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        $reviews = Review::with(['user', 'produto'])->latest()->get();
        // Transform the data to match the mock format
        $data = $reviews->map(function ($review) {
            return [
                'id' => $review->id,
                'cliente' => $review->user ? $review->user->name : 'Cliente Desconhecido',
                'produto' => $review->produto ? $review->produto->nome : 'Produto Deletado',
                'nota' => $review->rating,
                'comentario' => $review->comment,
                'status' => $review->status,
                'data' => $review->created_at->format('d/m/Y')
            ];
        });
        return response()->json(['data' => $data]);
    }

    public function updateStatus(Request $request, Review $review)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,aprovado,rejeitado'
        ]);

        $review->update(['status' => $validated['status']]);
        return response()->json(['data' => $review]);
    }

    public function destroy(Review $review)
    {
        $review->delete();
        return response()->json(['message' => 'Review deleted']);
    }
}
