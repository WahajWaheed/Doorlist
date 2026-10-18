import { AlertIcon } from './Icons';
import './states.css';

// One component for every failed request. A missing API key gets its own,
// more helpful message because it's the first thing anyone hits on setup.
export default function ErrorState({ error, onRetry, compact = false }) {
  const code = error?.code;
  const missingKey = code === 'NO_KEY' || code === 'BAD_KEY';

  return (
    <div className={`state-box state-box--error${compact ? ' state-box--compact' : ''}`} role="alert">
      <AlertIcon width={26} height={26} />
      <h3>{missingKey ? 'The Ticketmaster key is missing' : "That didn't load"}</h3>
      <p>{error?.message || 'Something went wrong while talking to Ticketmaster.'}</p>
      {missingKey && (
        <ol className="state-box__steps">
          <li>
            Get a Consumer Key at <strong>developer.ticketmaster.com</strong>
          </li>
          <li>
            Copy <code>.env.example</code> to <code>.env</code> and paste the key in
          </li>
          <li>Restart the dev server</li>
        </ol>
      )}
      {onRetry && !missingKey && (
        <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
