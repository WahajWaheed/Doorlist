import './AuthShell.css';

// Shared frame for the login and register screens: a ticket-stub panel on the
// left (hidden on small screens) and the form on the right.
export default function AuthShell({ eyebrow, title, aside, children }) {
  return (
    <div className="container auth">
      <aside className="auth__stub" aria-hidden="true">
        <span className="label">Admit one</span>
        <p className="auth__quote">{aside}</p>
        <div className="auth__perf" />
        <div className="auth__serial">
          <span className="label">No.</span>
          <span>0042 / DOORLIST</span>
        </div>
      </aside>

      <section className="auth__panel" aria-labelledby="auth-title">
        <p className="label">{eyebrow}</p>
        <h1 id="auth-title">{title}</h1>
        {children}
      </section>
    </div>
  );
}
