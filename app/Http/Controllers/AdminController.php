<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Console admins and what each may do. Only super admins can create, edit
 * or remove other super admins; nobody can deactivate or delete themselves.
 */
class AdminController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Admins/Index', [
            'admins' => User::orderByDesc('is_super_admin')->orderBy('name')
                ->get(['id', 'name', 'email', 'is_super_admin', 'permissions', 'is_active', 'created_at']),
            'groups' => Permissions::GROUPS,
            'canManageSuperAdmins' => (bool) $request->user()->is_super_admin,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request, null);

        User::create($data);

        return back()->with('success', "{$data['name']} has been added.");
    }

    public function update(Request $request, User $admin): RedirectResponse
    {
        $this->guardSuperAdmin($request, $admin);

        $data = $this->validated($request, $admin);

        if ($admin->is($request->user()) && !$data['is_super_admin'] && $admin->is_super_admin) {
            throw ValidationException::withMessages(['is_super_admin' => 'You cannot remove your own super admin role.']);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $admin->update($data);

        return back()->with('success', "{$admin->name} has been updated.");
    }

    public function toggleStatus(Request $request, User $admin): RedirectResponse
    {
        $this->guardSuperAdmin($request, $admin);
        $this->guardSelf($request, $admin, 'deactivate');

        $admin->update(['is_active' => !$admin->is_active]);

        // End their open sessions straight away rather than at next request.
        if (!$admin->is_active && config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))->where('user_id', $admin->id)->delete();
        }

        return back()->with('success', "{$admin->name} has been " . ($admin->is_active ? 'activated.' : 'deactivated.'));
    }

    public function destroy(Request $request, User $admin): RedirectResponse
    {
        $this->guardSuperAdmin($request, $admin);
        $this->guardSelf($request, $admin, 'delete');

        $admin->delete();

        return back()->with('success', "{$admin->name} has been removed.");
    }

    protected function validated(Request $request, ?User $admin): array
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($admin?->id)],
            'password' => [$admin ? 'nullable' : 'required', 'string', Password::min(8)],
            'is_super_admin' => 'boolean',
            'permissions' => 'array',
            'permissions.*' => ['string', Rule::in(Permissions::all())],
        ]);

        $data['is_super_admin'] = (bool) ($data['is_super_admin'] ?? false);
        $data['permissions'] = array_values(array_unique($data['permissions'] ?? []));

        if ($data['is_super_admin'] && !$request->user()->is_super_admin) {
            throw ValidationException::withMessages(['is_super_admin' => 'Only a super admin can grant the super admin role.']);
        }

        return $data;
    }

    protected function guardSuperAdmin(Request $request, User $admin): void
    {
        abort_if($admin->is_super_admin && !$request->user()->is_super_admin, 403, 'Only a super admin can change another super admin.');
    }

    protected function guardSelf(Request $request, User $admin, string $action): void
    {
        if ($admin->is($request->user())) {
            throw ValidationException::withMessages(['admin' => "You cannot {$action} your own account."]);
        }
    }
}
