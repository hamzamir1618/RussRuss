import { MODEL_CREDIT as M } from '../data/copy';

/** The licence credit for the rabbit's 3D model (CC BY 4.0 requires it wherever he appears). */
export function ModelCredit({ className = '' }: { className?: string }) {
  return (
    <p className={`model-credit ${className}`}>
      Rabbit model: <a href={M.url} target="_blank" rel="noopener noreferrer">“{M.title}”</a> by {M.author},{' '}
      <a href={M.licenseUrl} target="_blank" rel="noopener noreferrer">{M.license}</a>, {M.changes}.
    </p>
  );
}
