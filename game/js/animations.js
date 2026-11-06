import { PLAYER } from './config.js';

const { gsap } = window;

const IDLE = { ease: 'sine.inOut', yoyo: true };
const IDLE_REPEATS = 9; // endcard loops settle after about 10 seconds

// Decorative motion only. Everything here ends in the design's exact layout, so the
// reduced-motion path can skip it and show the final state straight away.
export function createAnimations({ gesture, headline, canvas, game, redraw }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let intro = null;
  let idleLoops = [];
  let endcardContext = null;

  // Most endcard layers are full-stage PNGs, so each one needs its own pivot point.
  gsap.utils.toArray('[data-origin]').forEach((element) => {
    gsap.set(element, { transformOrigin: element.dataset.origin });
  });

  const startIdle = () => {
    idleLoops = [
      gsap.to(gesture, { ...IDLE, scale: 1.07, duration: 0.6, repeat: -1 }),
      gsap.to(game, { ...IDLE, playerY: PLAYER.y - 6, duration: 0.9, repeat: -1, onUpdate: redraw }),
    ];
  };

  const playFail = (card) => {
    const bacteria = card.querySelectorAll('.bacterium');
    const buttons = card.querySelectorAll('.endcard-button');

    gsap
      .timeline({
        onComplete() {
          gsap.to(bacteria, { ...IDLE, y: -5, rotation: 4, duration: 1.2, stagger: 0.15, repeat: IDLE_REPEATS });
          gsap.to(card.querySelector('.js-clickout'), { ...IDLE, scale: 1.04, duration: 0.7, repeat: IDLE_REPEATS });
        },
      })
      .from(card.querySelector('.bubble'), { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' })
      .from(bacteria, { scale: 0, rotation: -30, duration: 0.45, stagger: 0.06, ease: 'back.out(2)' }, '-=0.25')
      .from(card.querySelector('.poo'), { y: -50, duration: 0.7, ease: 'bounce.out' }, '-=0.45')
      .from(card.querySelector('.headline-text'), { y: 18, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.35')
      .fromTo(buttons, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(2)' }, '-=0.1')
      .set(buttons, { pointerEvents: 'auto' });
  };

  const playWin = (card) => {
    const confetti = card.querySelector('.confetti');
    const poo = card.querySelector('.poo');
    const button = card.querySelector('.endcard-button');

    gsap
      .timeline({
        onComplete() {
          gsap.to(confetti, { ...IDLE, y: 6, duration: 1.6, repeat: IDLE_REPEATS });
          gsap.to(poo, { y: -10, duration: 0.28, ease: 'power1.out', yoyo: true, repeat: 5, repeatDelay: 0.1 });
          gsap.to(button, { ...IDLE, scale: 1.04, duration: 0.7, repeat: IDLE_REPEATS });
        },
      })
      .from(card.querySelector('.bubble'), { scale: 0.7, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' })
      .from(confetti, { scale: 0.15, rotation: -12, opacity: 0, duration: 0.8, ease: 'back.out(1.3)' }, '-=0.3')
      .from(poo, { y: 70, duration: 0.8, ease: 'bounce.out' }, '-=0.5')
      .from(card.querySelector('.headline-text'), { y: 18, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.35')
      .fromTo(button, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.1')
      .set(button, { pointerEvents: 'auto' });
  };

  return {
    playIntro() {
      if (reducedMotion) return;

      intro = gsap
        .timeline({ onComplete: startIdle })
        .from(canvas, { opacity: 0, duration: 0.35, ease: 'power1.out', clearProps: 'opacity' })
        .from(headline, { y: -14, opacity: 0, duration: 0.5, ease: 'power2.out', clearProps: 'opacity,transform' }, 0.1)
        .fromTo(game, { playerY: PLAYER.y - 70 }, { playerY: PLAYER.y, duration: 0.8, ease: 'bounce.out', onUpdate: redraw }, 0.2)
        .from(gesture, { scale: 0.6, opacity: 0, duration: 0.4, ease: 'back.out(2)', clearProps: 'opacity' }, 0.65);
    },

    // The first tap can land at any moment, so the intro jumps to its final state.
    stopIntro() {
      intro?.progress(1).kill();
      idleLoops.forEach((tween) => tween.kill());
      idleLoops = [];
      gsap.set(gesture, { clearProps: 'transform' });
    },

    playEndcard(card, hasWon) {
      endcardContext = gsap.context(() => {
        const buttons = card.querySelectorAll('.endcard-button');
        if (!reducedMotion) (hasWon ? playWin : playFail)(card);
        // Even with no motion, buttons wait a moment so a frantic tap can't press one.
        else gsap.to(buttons, { autoAlpha: 1, pointerEvents: 'auto', duration: 0, delay: 0.5 });
      });
    },

    clearEndcard() {
      endcardContext?.revert();
      endcardContext = null;
    },

    pause() {
      gsap.globalTimeline.pause();
    },

    resume() {
      gsap.globalTimeline.resume();
    },
  };
}
