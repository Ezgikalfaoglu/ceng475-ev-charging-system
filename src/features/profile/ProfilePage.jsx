// User profile. OWNER: Melike (dev/melike-sahin).
// Baseline on main: shows the signed-in user's data (read only).
// TODO(Melike): edit form (name, phone, vehicle model, connector, battery size) with validation,
//               PUT /api/users/profile, update the user in AuthContext with setUser(...),
//               change-password form, delete-account flow with <ConfirmDialog>.
import Button from '../../components/Button.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StarterNotice from '../../components/StarterNotice.jsx';
import Badge from '../../components/Badge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { MELIKE } from '../../../shared/owners.js';

const show = (value, suffix = '') => (value ? `${value}${suffix}` : 'Not set');

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="My profile" subtitle="Your account and vehicle details." actions={<Button icon="edit" disabled title="Available after Melike's branch is merged">Edit profile</Button>} />
      <StarterNotice owner={MELIKE} todo={['Edit profile form with validation', 'Change password', 'Delete account with confirmation']} />
      <div className="grid grid--2">
        <section className="card card__body" aria-labelledby="account-title">
          <h2 id="account-title" style={{ marginBottom: 'var(--space-4)' }}>Account</h2>
          <dl className="definition">
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>E-mail</dt>
            <dd>{user.email}</dd>
            <dt>Phone</dt>
            <dd>{show(user.phone)}</dd>
            <dt>Role</dt>
            <dd>
              <Badge tone={user.role === 'admin' ? 'accent' : 'info'}>{user.role}</Badge>
            </dd>
          </dl>
        </section>
        <section className="card card__body" aria-labelledby="vehicle-title">
          <h2 id="vehicle-title" style={{ marginBottom: 'var(--space-4)' }}>Vehicle</h2>
          <dl className="definition">
            <dt>Model</dt>
            <dd>{show(user.vehicleModel)}</dd>
            <dt>Connector</dt>
            <dd>{show(user.vehicleConnector)}</dd>
            <dt>Battery size</dt>
            <dd>{show(user.batteryKwh, ' kWh')}</dd>
          </dl>
        </section>
      </div>
    </>
  );
}
