<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    | Joint Revenue Board (JRB) State API.
    |
    | base_url is the host root only — login lives under /api/v1 and the
    | lookups under /api, so the paths are built in JtbService.
    */
    'jrb' => [
        'base_url' => env('JRB_BASE_URL', 'https://api.jrb.gov.ng:8311'),
        'email' => env('JRB_EMAIL'),
        'password' => env('JRB_PASSWORD'),
        'client_name' => env('JRB_CLIENT_NAME', 'jrb'),
    ],


    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
