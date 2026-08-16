<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Category::orderBy('nome', 'asc')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate(['nome' => 'required|string']);

        $category = Category::updateOrCreate(
            ['id' => $request->id],
            $request->only(['nome', 'status'])
        );

        return response()->json(['status' => 'success', 'data' => $category]);
    }

    public function destroy($id)
    {
        Category::destroy($id);
        return response()->json(['status' => 'success']);
    }
}