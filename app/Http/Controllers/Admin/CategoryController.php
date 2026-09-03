<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Categoria;
use App\Services\CacheFallbackService;
use App\Domain\Tenancy\TenantContextStore;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categorias = CacheFallbackService::remember('admin_categorias_all', 60 * 24, function () {
            return Categoria::query()
                ->withCount('produtos as qtd_produtos')
                ->orderBy('nome')
                ->get();
        });

        return response()->json(['status' => 'success', 'data' => $categorias]);
    }

    public function store(SaveCategoryRequest $request): JsonResponse
    {
        $attributes = $this->validatedAttributes($request);
        $attributes['slug'] = $this->nextSlug($attributes['nome']);

        $categoria = Categoria::query()->create($attributes);

        if ($image = $this->storeUploadedImage($request)) {
            $categoria->update(['img' => $image]);
        }

        $categoria->loadCount('produtos as qtd_produtos');
        $this->flushCategoryCaches();

        return response()->json(['status' => 'success', 'data' => $categoria], 201);
    }

    public function update(SaveCategoryRequest $request, int $id): JsonResponse
    {
        $categoria = Categoria::query()->findOrFail($id);
        $attributes = $this->validatedAttributes($request);

        if ($attributes['nome'] !== $categoria->nome) {
            $attributes['slug'] = $this->nextSlug($attributes['nome'], $categoria);
        }

        if ($image = $this->storeUploadedImage($request)) {
            $this->deleteStoredImage($categoria->img);
            $attributes['img'] = $image;
        }

        $categoria->update($attributes);
        $categoria->loadCount('produtos as qtd_produtos');
        $this->flushCategoryCaches();

        return response()->json(['status' => 'success', 'data' => $categoria]);
    }

    public function destroy(int $id): JsonResponse
    {
        $categoria = Categoria::query()->findOrFail($id);

        if ($categoria->produtos()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Não é possível excluir uma categoria que possui produtos vinculados.',
            ], 422);
        }

        $this->deleteStoredImage($categoria->img);
        $categoria->delete();
        $this->flushCategoryCaches();

        return response()->json(['status' => 'success']);
    }

    /**
     * @return array{nome: string, descricao: ?string, status: string, ativo: bool}
     */
    private function validatedAttributes(SaveCategoryRequest $request): array
    {
        $validated = $request->validated();
        $status = $validated['status'];

        return [
            'nome' => $validated['nome'],
            'descricao' => $validated['descricao'] ?? null,
            'status' => $status,
            'ativo' => $status === Categoria::STATUS_ATIVO,
        ];
    }

    private function nextSlug(string $nome, ?Categoria $ignore = null): string
    {
        $base = Str::slug($nome) ?: 'categoria';
        $slug = $base;
        $suffix = 2;

        while (true) {
            $query = Categoria::query()->where('slug', $slug);

            if ($ignore !== null) {
                $query->where('id', '!=', $ignore->getKey());
            }

            if (! $query->exists()) {
                return $slug;
            }

            $slug = $base.'-'.$suffix;
            $suffix++;
        }
    }

    private function storeUploadedImage(SaveCategoryRequest $request): ?string
    {
        if (! $request->hasFile('img')) {
            return null;
        }

        $tenant = app(TenantContextStore::class)->require();
        $path = $request->file('img')->store('tenants/'.$tenant->tenantUuid.'/categorias', 'public');

        return asset('storage/'.$path);
    }

    private function deleteStoredImage(?string $image): void
    {
        if ($image === null || $image === '') {
            return;
        }

        $path = Str::after($image, asset('storage/'));

        if ($path === $image) {
            return;
        }

        $tenant = app(TenantContextStore::class)->require();
        $tenantDirectory = 'tenants/'.$tenant->tenantUuid.'/categorias/';

        // `categorias/` é o diretório legado já gerado pela aplicação antes
        // da separação por tenant; somente registros da categoria já resolvida
        // podem solicitar essa limpeza.
        if (! Str::startsWith($path, [$tenantDirectory, 'categorias/'])) {
            return;
        }

        Storage::disk('public')->delete($path);
    }

    private function flushCategoryCaches(): void
    {
        CacheFallbackService::forget('admin_categorias_all');
        CacheFallbackService::forget('storefront_categories_active');
    }
}
