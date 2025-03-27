<?php

namespace App\DataFixtures;

use App\Entity\User;
use App\Entity\WorkoutCategory;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private UserPasswordHasherInterface $passwordHasher;

    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Create a user with ROLE_USER
        $user = new User();
        $user->setUsername('user');
        $user->setEmail('user@example.com');
        $user->setRoles(['ROLE_USER']);
        $user->setIsEmailConfirmed(true);
        $user->setCreatedAt(new \DateTimeImmutable());

        $hashedPassword = $this->passwordHasher->hashPassword($user, 'user');
        $user->setPassword($hashedPassword);

        $manager->persist($user);

        // Create a user with ROLE_ADMIN and ROLE_USER
        $admin = new User();
        $admin->setUsername('admin');
        $admin->setEmail('admin@example.com');
        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setIsEmailConfirmed(true);
        $admin->setCreatedAt(new \DateTimeImmutable());

        $hashedPassword = $this->passwordHasher->hashPassword($admin, 'admin');
        $admin->setPassword($hashedPassword);

        $manager->persist($admin);

        $categories = [
            'Musculation',
            'Cardio',
            'Mobilité',
            'Sports collectifs',
            'Natation',
            'Vélo'
        ];

        foreach ($categories as $categoryName) {
            $category = new WorkoutCategory();
            $category->setName($categoryName);
            $manager->persist($category);
        }

        // Flush to save the users to the database
        $manager->flush();
    }
}
