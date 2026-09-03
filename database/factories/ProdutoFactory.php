<?php

namespace Database\Factories;

use App\Models\Produto;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Produto>
 */
class ProdutoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'categoria_id' => \App\Models\Categoria::factory(),
            'nome' => $this->faker->words(3, true),
            'slug' => $this->faker->unique()->slug,
            'descricao' => $this->faker->paragraph,
            'ativo' => true,
            'status_vitrine' => 'ATIVO',
            'preco' => $this->faker->randomFloat(2, 10, 1000),
        ];
    }
}
