import { linkTo, useRouter } from '../lib/router';
import { ADDRESS, HOURS } from '../data/copy';
import { Waves } from './Waves';
import { Wordmark } from './Wordmark';
import { Sticker } from './Sprite';
import { ModelCredit } from './ModelCredit';

/** Closing band for every page after the landing page (which ends on the stand). */
export function Footer() {
  const { go } = useRouter();
  return (
    <footer className="foot">
      <Waves className="foot-waves" />
      <div className="foot-in">
        <Wordmark id="footClip" className="foot-wm" />
        <div className="foot-cols">
          <p><span className="kick">Where</span>{ADDRESS}</p>
          <p><span className="kick">When</span>{HOURS}, every day</p>
          <ul>
            <li><a {...linkTo(go, 'menu')}>Menu</a></li>
            <li><a {...linkTo(go, 'visit')}>Find the stand</a></li>
            <li><a {...linkTo(go, 'order')}>Order for pickup</a></li>
          </ul>
        </div>
        <p className="foot-note">Prices, hours and the address are samples. <Sticker id="sparkle" className="foot-spark" color="#FFC300" /></p>
        <ModelCredit />
      </div>
    </footer>
  );
}
