import ArrowIcon from '../Utils/ArrowIcon'

export default function UserManagement({ users, user, userForm, onUserChange, onSubmit, onRoleChange, onRemove }) {
  return (
    <div className="admin-users-view">
      <form className="admin-form user-create-form" onSubmit={onSubmit}>
        <div className="admin-form-heading"><div><span>NEW ACCOUNT</span><h2>Create a user</h2></div></div>
        <div className="admin-input-row">
          <label>NAME<input required value={userForm.name} onChange={(event) => onUserChange('name', event.target.value)} /></label>
          <label>EMAIL<input required type="email" value={userForm.email} onChange={(event) => onUserChange('email', event.target.value)} /></label>
        </div>
        <div className="admin-input-row">
          <label>TEMPORARY PASSWORD<input required type="password" minLength="8" value={userForm.password} onChange={(event) => onUserChange('password', event.target.value)} /></label>
          <label>ROLE<select value={userForm.role} onChange={(event) => onUserChange('role', event.target.value)}><option value="user">Player</option><option value="admin">Administrator</option></select></label>
        </div>
        <button className="button button-primary" type="submit">Create account <ArrowIcon /></button>
      </form>

      <div className="admin-table-wrap">
        <div className="admin-table-title"><h2>User accounts</h2><span>{users.length} accounts</span></div>
        <table className="admin-table">
          <thead><tr><th>NAME</th><th>EMAIL</th><th>ROLE</th><th>JOINED</th><th>ACTIONS</th></tr></thead>
          <tbody>{users.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.name}{entry.id === user.id && <small className="you-tag">YOU</small>}</td>
              <td>{entry.email}</td>
              <td><select className="role-select" value={entry.role} disabled={entry.id === user.id} onChange={(event) => onRoleChange(entry, event.target.value)}><option value="user">Player</option><option value="admin">Admin</option></select></td>
              <td>{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—'}</td>
              <td className="table-actions">{entry.id !== user.id && <button className="danger-action" onClick={() => onRemove(entry)}>Delete</button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  )
}
