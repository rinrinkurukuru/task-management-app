<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->optional()->paragraph(),
            'estimated_minutes' => $this->faker->numberBetween(15, 240),
            'actual_minutes' => 0,
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'status' => $this->faker->randomElement(['todo', 'in_progress', 'completed', 'cancelled']),
            'day_of_week' => $this->faker->randomElement(['todo', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
            'position' => $this->faker->numberBetween(0, 10),
            'tags' => $this->faker->optional()->words(3),
            'due_date' => $this->faker->optional()->dateTimeBetween('now', '+1 month'),
            'completed_at' => null,
        ];
    }

    /**
     * Indicate that the task is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'completed',
            'completed_at' => now(),
            'actual_minutes' => $this->faker->numberBetween(15, 240),
        ]);
    }

    /**
     * Indicate that the task is in progress.
     */
    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'in_progress',
            'actual_minutes' => $this->faker->numberBetween(5, 120),
        ]);
    }

    /**
     * Indicate that the task is todo.
     */
    public function todo(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'todo',
            'actual_minutes' => 0,
            'completed_at' => null,
        ]);
    }
}