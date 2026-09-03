<?php

namespace Database\Factories;

use App\Models\ProdutoVariacao;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProdutoVariacao>
 */
class ProdutoVariacaoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'produto_id' => \App\Models\Produto::factory(),
            'tipo' => 'Cor',
            'nome' => $this->faker->colorName,
            'sku' => $this->faker->unique()->isbn10,
            'estoque' => $this->faker->numberBetween(0, 100),
        ];
    }
}
