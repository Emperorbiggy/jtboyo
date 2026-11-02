<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function superAdmin(): User
    {
        return User::factory()->create(['is_super_admin' => true]);
    }

    public function test_super_admin_can_add_an_admin_with_permissions(): void
    {
        $this->actingAs($this->superAdmin())
            ->post('/admins', [
                'name' => 'Clerk',
                'email' => 'clerk@example.com',
                'password' => 'secret-pass',
                'permissions' => ['verify', 'individual.lookup'],
            ])
            ->assertRedirect();

        $clerk = User::where('email', 'clerk@example.com')->first();
        $this->assertSame(['verify', 'individual.lookup'], $clerk->permissions);
        $this->assertFalse($clerk->is_super_admin);
    }

    public function test_permissions_gate_pages_and_console_api(): void
    {
        $clerk = User::factory()->create(['permissions' => ['verify']]);

        $this->actingAs($clerk)->get('/jrb/taxid-verification')->assertOk();
        $this->actingAs($clerk)->get('/jrb/individual/register')->assertForbidden();
        $this->actingAs($clerk)->postJson('/api/jrb/individual/lookup', [])->assertForbidden();
        $this->actingAs($clerk)->get('/admins')->assertForbidden();
        $this->actingAs($clerk)->get('/create-app')->assertForbidden();
        $this->actingAs($clerk)->getJson('/api/v1/auth-apps')->assertForbidden();
    }

    public function test_unknown_permissions_are_rejected(): void
    {
        $this->actingAs($this->superAdmin())
            ->post('/admins', [
                'name' => 'X', 'email' => 'x@example.com', 'password' => 'secret-pass',
                'permissions' => ['delete.everything'],
            ])
            ->assertSessionHasErrors('permissions.0');
    }

    public function test_admin_manager_cannot_create_or_touch_super_admins(): void
    {
        $manager = User::factory()->create(['permissions' => ['admins.manage']]);
        $super = $this->superAdmin();

        $this->actingAs($manager)
            ->post('/admins', ['name' => 'X', 'email' => 'x@example.com', 'password' => 'secret-pass', 'is_super_admin' => true])
            ->assertSessionHasErrors('is_super_admin');

        $this->actingAs($manager)->delete("/admins/{$super->id}")->assertForbidden();
        $this->actingAs($manager)->patch("/admins/{$super->id}/status")->assertForbidden();
    }

    public function test_cannot_deactivate_or_delete_yourself(): void
    {
        $super = $this->superAdmin();

        $this->actingAs($super)->patch("/admins/{$super->id}/status")->assertSessionHasErrors('admin');
        $this->actingAs($super)->delete("/admins/{$super->id}")->assertSessionHasErrors('admin');
        $this->assertTrue($super->fresh()->is_active);
    }

    public function test_deactivated_admin_cannot_sign_in_and_is_signed_out(): void
    {
        $user = User::factory()->create(['is_active' => false, 'permissions' => ['verify']]);

        $this->post('/login', ['email' => $user->email, 'password' => 'password'])->assertSessionHasErrors('email');
        $this->assertGuest();

        $this->actingAs($user)->get('/jrb/taxid-verification')->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_editing_keeps_password_when_left_blank(): void
    {
        $super = $this->superAdmin();
        $clerk = User::factory()->create();
        $hash = $clerk->password;

        $this->actingAs($super)
            ->put("/admins/{$clerk->id}", ['name' => 'Renamed', 'email' => $clerk->email, 'password' => '', 'permissions' => ['resolve']])
            ->assertRedirect();

        $clerk->refresh();
        $this->assertSame('Renamed', $clerk->name);
        $this->assertSame($hash, $clerk->password);
        $this->assertSame(['resolve'], $clerk->permissions);
    }

    public function test_guide_is_available_to_any_signed_in_admin(): void
    {
        $this->get('/guide')->assertRedirect();
        $this->actingAs(User::factory()->create())->get('/guide')->assertOk();
    }
}
