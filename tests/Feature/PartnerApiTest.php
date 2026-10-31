<?php

namespace Tests\Feature;

use App\Models\AuthApp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PartnerApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.jrb.base_url' => 'https://jrb.test:8311',
            'services.jrb.email' => 'ops@example.com',
            'services.jrb.password' => 'secret',
        ]);

        Http::fake([
            'jrb.test:8311/api/v1/Account/login*' => Http::response(['success' => 'true', 'tokenId' => 'TOK']),
            'jrb.test:8311/api/TaxIdVerification/verify*' => Http::response([
                'success' => true, 'message' => 'Tax ID verified', 'status' => 200, 'data' => ['taxId' => '2513706419'],
            ]),
            'jrb.test:8311/api/Lookups/states*' => Http::response([['code' => 'OY', 'name' => 'OYO']]),
        ]);
    }

    protected function app(array $ips = ['127.0.0.1'], bool $active = true): AuthApp
    {
        return AuthApp::create([
            'app_name' => 'Consultant A',
            'token' => 'test-key-123',
            'whitelisted_ips' => $ips,
            'request_count' => 0,
            'status' => $active,
        ]);
    }

    public function test_valid_key_from_whitelisted_ip_verifies_tax_id(): void
    {
        $app = $this->app();

        $this->withToken('test-key-123')
            ->postJson('/api/v1/taxid/verify', ['taxId' => '2513706419'])
            ->assertOk()
            ->assertJsonPath('data.taxId', '2513706419');

        $this->assertSame(1, $app->fresh()->request_count);
    }

    public function test_legacy_verify_tin_still_works(): void
    {
        $this->app();

        $this->withToken('test-key-123')
            ->postJson('/api/v1/verify-tin', ['type' => 'individual', 'tin' => '2513706419'])
            ->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_lookups_are_available(): void
    {
        $this->app();

        $this->withToken('test-key-123')
            ->getJson('/api/v1/lookups/states')
            ->assertOk();
    }

    public function test_whitelist_tolerates_spaces(): void
    {
        $this->app(['10.0.0.1', ' 127.0.0.1']);

        $this->withToken('test-key-123')
            ->postJson('/api/v1/taxid/verify', ['taxId' => '1'])
            ->assertOk();
    }

    public function test_rejects_missing_unknown_or_disabled_keys_and_other_ips(): void
    {
        $this->postJson('/api/v1/taxid/verify', ['taxId' => '1'])->assertStatus(401);
        $this->withToken('nope')->postJson('/api/v1/taxid/verify', ['taxId' => '1'])->assertStatus(401);

        $app = $this->app(['10.0.0.1']);
        $this->withToken('test-key-123')->postJson('/api/v1/taxid/verify', ['taxId' => '1'])->assertStatus(403);

        $app->update(['status' => false, 'whitelisted_ips' => ['127.0.0.1']]);
        $this->withToken('test-key-123')->postJson('/api/v1/taxid/verify', ['taxId' => '1'])->assertStatus(401);
    }

    public function test_validation_errors_are_json_without_accept_header(): void
    {
        $this->app();

        $this->withToken('test-key-123')
            ->post('/api/v1/taxid/verify', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('taxId');
    }

    public function test_developer_docs_are_public(): void
    {
        $this->get('/developers')->assertOk();
    }

    public function test_key_management_requires_login(): void
    {
        $this->getJson('/api/v1/auth-apps')->assertStatus(401);
        $this->postJson('/api/v1/generate-token', ['app_name' => 'x', 'whitelisted_ips' => '1.1.1.1'])->assertStatus(401);
        $this->get('/create-app')->assertRedirect();
        $this->get('/jrb/taxid-verification')->assertRedirect();

        $this->actingAs(User::factory()->create())
            ->postJson('/api/v1/generate-token', ['app_name' => 'Consultant B', 'whitelisted_ips' => '1.1.1.1'])
            ->assertCreated();
    }
}
