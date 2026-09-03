<?php

namespace Database\Factories;

use App\Models\Categoria;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Categoria>
 */
class CategoriaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nome' => $this->faker->word,
            'slug' => $this->faker->unique()->slug,
            'descricao' => $this->faker->sentence,
            'ativo' => true,
            'status' => \App\Models\Categoria::STATUS_ATIVO,
        ];
    }
}
