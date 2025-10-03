<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Development Tools', 'slug' => 'development-tools', 'description' => 'Tools for software development and coding'],
            ['name' => 'AI & Machine Learning', 'slug' => 'ai-ml', 'description' => 'AI and machine learning platforms and services'],
            ['name' => 'Design & UI/UX', 'slug' => 'design-ui-ux', 'description' => 'Design and user experience tools'],
            ['name' => 'Data & Analytics', 'slug' => 'data-analytics', 'description' => 'Data analysis and business intelligence tools'],
            ['name' => 'Productivity', 'slug' => 'productivity', 'description' => 'General productivity and workflow tools'],
            ['name' => 'DevOps & Infrastructure', 'slug' => 'devops-infrastructure', 'description' => 'DevOps, deployment, and infrastructure management tools'],
        ];

        foreach ($categories as $category) {
            \App\Models\Category::create($category);
        }
    }
}
