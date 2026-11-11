import { Fragment } from 'react';
import { vars } from '../lib/motion';

/**
 * Text split into per-letter spans, words kept together so lines still wrap between words.
 * Each letter carries `--i` (its index across the whole string) for the rolling baseline.
 * Keep the space between `.word` spans, never inside one, or the browser drops it.
 */
export function Chars({ text }: { text: string }) {
  let i = 0;
  return (
    <>
      {text.split(' ').map((w, wi, all) => (
        <Fragment key={wi}>
          <span className="word" aria-hidden="true">
            {[...w].map((c, ci) => <span key={ci} className="ch" style={vars({ '--i': i++ })}>{c}</span>)}
          </span>
          {wi < all.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  );
}
