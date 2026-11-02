<?php

namespace App\Support;

/**
 * Every permission an admin can be granted, grouped as the Admins page shows
 * them. Super admins pass every check without needing any of these.
 */
class Permissions
{
    public const GROUPS = [
        'Individual' => [
            'individual.lookup' => 'Tax ID lookup',
            'individual.register' => 'Complete registration',
        ],
        'Non-Individual' => [
            'non_individual.lookup' => 'Tax ID lookup',
            'non_individual.register' => 'Complete registration',
        ],
        'Resolve & verify' => [
            'resolve' => 'Resolve cooperatives and MDAs',
            'verify' => 'Tax ID verification',
        ],
        'Administration' => [
            'api_keys.manage' => 'Manage partner API keys',
            'admins.manage' => 'Manage admins',
        ],
    ];

    /** @return list<string> */
    public static function all(): array
    {
        return array_merge(...array_map('array_keys', array_values(self::GROUPS)));
    }
}
