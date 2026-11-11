import { useMemo, useRef, useState, type FormEvent } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, RM, vars } from '../lib/motion';
import { useIntro } from '../lib/intro';
import { burstFrom } from '../lib/burst';
import { pickupSlots, prettyTime, useBag } from '../lib/bag';
import { linkTo, useRouter } from '../lib/router';
import { MENU, money } from '../data/menu';
import { ADDRESS } from '../data/copy';
import { ORDER } from '../data/pages';
import { headIntro, PageHead } from '../components/PageHead';

/**
 * Order ahead: what's in the bag (change counts, or add from the four juices), a pickup time from the
 * 15-minute slots left today, and a name to call out. Payment happens at the stand.
 */
export function OrderPage() {
  const root = useRef<HTMLDivElement>(null);
  const { go } = useRouter();
  const { lines, count, total, add, setQty, place } = useBag();
  const { day, slots } = useMemo(() => pickupSlots(), []);
  const [time, setTime] = useState(slots[0] ?? '');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tried, setTried] = useState(false);

  useIntro(root, () => headIntro(gsap.timeline())
    .fromTo('.ord-col > *', { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'expo.out', stagger: 0.07 }, 0.3));

  useGSAP(() => {
    if (RM) return;
    gsap.fromTo('.slot-btn', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.5)', stagger: { each: 0.02, from: 'start' }, scrollTrigger: { trigger: '.slots', start: 'top 92%' } });
  }, { scope: root });

  const problem = !count ? 'Add at least one juice.' : !time ? 'Pick a pickup time.' : !name.trim() ? 'Add a name so we know whose cup it is.' : '';

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    if (problem) return;
    place({ time, name: name.trim(), phone: phone.trim() || undefined });
    const btn = (e.currentTarget.querySelector('.place') as HTMLElement).getBoundingClientRect();
    go('confirm', { clientX: btn.left + btn.width / 2, clientY: btn.top + btn.height / 2 });
  };

  return (
    <div className="order-page" ref={root}>
      <PageHead kicker={ORDER.kicker} title={ORDER.title} lede={ORDER.lede} />

      <form className="ord" onSubmit={submit} noValidate>
        <div className="ord-col">
          <section className="ord-card" aria-labelledby="bag-h">
            <h2 id="bag-h" className="ord-h"><span className="ord-n">1</span> The bag</h2>
            {lines.length ? (
              <ul className="lines">
                {lines.map(l => (
                  <li key={l.key} className="line" style={vars({ '--fc': l.juice.tint })}>
                    <img src={l.juice.cup} alt="" />
                    <div className="line-txt">
                      <a {...linkTo(go, 'juice', l.juice.id)}>{l.juice.name}</a>
                      <span>{l.juice.sizes.find(s => s.ml === l.ml)?.label} · {money(l.price)}</span>
                    </div>
                    <div className="qty sm" role="group" aria-label={`How many ${l.juice.name}`}>
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label={l.qty === 1 ? 'Remove' : 'One less'}>{l.qty === 1 ? '×' : '−'}</button>
                      <output>{l.qty}</output>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label="One more">+</button>
                    </div>
                    <b className="line-sum">{money(l.price * l.qty)}</b>
                  </li>
                ))}
              </ul>
            ) : <p className="empty">{ORDER.empty} Tap a cup to add one.</p>}
            <div className="quick" aria-label="Add a juice">
              {MENU.map(j => (
                <button key={j.id} type="button" className="quick-btn" style={vars({ '--fc': j.tint })}
                  onClick={e => { add(j.id); burstFrom(e.currentTarget, 0.5, 0.2, j.juice, 18, 0.8); }}>
                  <img src={j.cup} alt="" />
                  <span>+ {j.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="ord-card" aria-labelledby="time-h">
            <h2 id="time-h" className="ord-h"><span className="ord-n">2</span> Pickup time <em>{day}</em></h2>
            {slots.length ? (
              <div className="slots" role="radiogroup" aria-labelledby="time-h">
                {slots.map(s => (
                  <button key={s} type="button" role="radio" aria-checked={s === time} className={`slot-btn ${s === time ? 'on' : ''}`} onClick={() => setTime(s)}>
                    {prettyTime(s)}
                  </button>
                ))}
              </div>
            ) : <p className="empty">No pickup times left. Come by the window instead.</p>}
          </section>

          <section className="ord-card" aria-labelledby="you-h">
            <h2 id="you-h" className="ord-h"><span className="ord-n">3</span> Who’s it for</h2>
            <label className="field">
              <span>Name on the cup</span>
              <input value={name} onChange={e => setName(e.target.value)} autoComplete="given-name" maxLength={30} aria-invalid={tried && !name.trim()} placeholder="Sam" />
            </label>
            <label className="field">
              <span>Phone, if you want a text when it’s ready <em>(optional)</em></span>
              <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" autoComplete="tel" inputMode="tel" placeholder="555 0100" />
            </label>
          </section>
        </div>

        <aside className="receipt" aria-label="Summary">
          <p className="kick">Pickup at</p>
          <p className="rc-where">{ADDRESS}</p>
          <p className="rc-when">{time ? `${day}, ${prettyTime(time)}` : 'Pick a time'}</p>
          <ul className="rc-lines">
            {lines.map(l => <li key={l.key}><span>{l.qty} × {l.juice.name} <em>{l.ml === 350 ? '350 ml' : '1 L'}</em></span><b>{money(l.price * l.qty)}</b></li>)}
          </ul>
          <p className="rc-total"><span>Total</span><b>{money(total)}</b></p>
          <p className="rc-pay">You pay at the stand, card or cash.</p>
          {tried && problem && <p className="rc-problem" role="alert">{problem}</p>}
          <button className="btn big place mag" type="submit">Place order</button>
        </aside>
      </form>
    </div>
  );
}
