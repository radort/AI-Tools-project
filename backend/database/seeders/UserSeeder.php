<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Developer',
                'email' => 'developer@example.com',
                'password' => Hash::make('password123'),
                'role' => 'developer',
                'spatie_role' => 'developer',
            ],
            [
                'name' => 'Designer',
                'email' => 'designer@example.com',
                'password' => Hash::make('password123'),
                'role' => 'designer',
                'spatie_role' => 'designer',
            ],
            [
                'name' => 'Analyst',
                'email' => 'analyst@example.com',
                'password' => Hash::make('password123'),
                'role' => 'analyst',
                'spatie_role' => 'analyst',
            ],
            [
                'name' => 'Project Manager',
                'email' => 'pm@example.com',
                'password' => Hash::make('password123'),
                'role' => 'pm',
                'spatie_role' => 'pm',
            ],
            [
                'name' => 'Owner',
                'email' => 'owner@example.com',
                'password' => Hash::make('password123'),
                'role' => 'owner',
                'spatie_role' => 'owner',
            ],
        ];

        foreach ($users as $userData) {
            $spatieRole = $userData['spatie_role'];
            unset($userData['spatie_role']);

            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            // Assign role using Spatie
            if (!\Spatie\Permission\Models\Role::where('name', $spatieRole)->exists()) {
                \Spatie\Permission\Models\Role::create(['name' => $spatieRole]);
            }

            if (!$user->hasRole($spatieRole)) {
                $user->assignRole($spatieRole);
            }
        }
    }
}
