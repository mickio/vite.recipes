class PageTransition extends HTMLElement {
    static get observedAttributes() {
        // 'data-before-transition' und 'data-after-transition' wurden entfernt,
        // da wir stattdessen native Event Listener verwenden.
        return ['data-name', 'data-type', 'data-duration', 'data-params'];
    }

    static get transitions() {
        return ['enlarge', 'flyaway', 'slide-left', 'slide-right', 'zoom', 'fade'];
    }

    constructor() {
        super();
        this.transitionNotTriggered = true;

        // Shadow DOM initialisieren
        this.attachShadow({ mode: 'open' });

        // Container und Slot erstellen
        this.transitionContainer = document.createElement('div');
        this.transitionContainer.innerHTML = '<slot></slot>';

        // Styles direkt injizieren, statt auf externe Dateien zu verweisen.
        // Die spezifischen Animations-Klassen können weiterhin im globalen CSS
        // deines Projekts liegen, da der Container per ::part() gestylt werden kann
        // oder die Klassen direkt auf den Container wirken.
        const style = document.createElement('style');
        style.textContent = `
:host {
    --duration: 3s;
    --timing-function: ease-in;
    --box-positionX: 50vw;
    --box-positionY: 50vh;
    --box-width: 0;
    --box-height: 0;
    --scrollX:0;
    --scrollY:0;
    display:block;
}
.enlarge-enter-start, .minimize-leave-end {
  transform: translate(calc(var(--box-positionX) + var(--scrollX)),calc(var(--box-positionY) - var(--scrollY)));
  width: var(--box-width) !important;
  height: var(--box-height) !important;
  opacity: 0;
}
.enlarge-enter-end, .minimize-leave-start {
  transition: all var(--duration) ease-in;
  transform: translate(0,0);
  width: 100vw;
  height: 100vh;
  opacity: 1;
}
.flyaway-leave-start, .entry-leave-start {
    opacity: 1;
    transform: scale3d(1.,1.,1.) translate(0,0)
}
.flyaway-leave-end, .entry-leave-end {
    opacity: 0;
    transform: scale3d(3.0,3.0,3.0) translate(200px,20px);
    transition: all var(--duration) cubic-bezier(0.4, 0.2, .9, 1);
}
.slide-enter-start {
  transform: translate(-100vw) scale3d(.9, 0.9,.9);
}
.slide-enter-end {
  transition: transform var(--duration) cubic-bezier(1,0.5,0.5,1);
  transform: translate(0,0) scale3d(1,1,1);
}
.slide-left-enter-start,.slide-right-leave-end {
    transition: transform var(--duration) cubic-bezier(0.68, .55, 0.265, 1);
    transform: translateX(100vw);
}
.slide-left-enter-end,.slide-right-leave-start {
  transition: transform var(--duration) cubic-bezier(0.68, .55, 0.265, 1);
  transform: translateX(0);
}
.slide-right-enter-start,.slide-left-leave-end {
    transition: transform var(--duration) cubic-bezier(0.68, .55, 0.265, 1);
    transform: translateX(-100vw);
}
.slide-right-enter-end,.slide-left-leave-start {
  transition: transform var(--duration) cubic-bezier(0.68, .55, 0.265, 1);
  transform: translateX(0);
}
.zoom-enter-start,.entry-enter-start {
  transition: transform, opacity var(--duration) ease-in;
  transform: scale3d(1.2,1.2,1.2) translate(-.05em,-.05em);
  opacity:0;
}
.zoom-enter-end, .entry-enter-end {
  transition: transform var(--duration) ease-out, opacity var(--duration) cubic-bezier(1, 0, 0, 1);
  transform: scale3d(1.,1.,1) translate(0,0);
  opacity: 1;
}
/* fade */
.fade-enter, .fade-leave {
  transition: opacity var(--duration) ease-out;
}
.fade-enter-end, .fade-leave-start {
  opacity: 1;
}
.fade-leave-end, .fade-enter-start {
  opacity: 0;
}
        `;
        this.transitionContainer.classList.add('transition-container');

        this.shadowRoot.append(style, this.transitionContainer);

        // Methoden an 'this' binden, damit sie als Event-Listener sauber
        // hinzugefügt und wieder entfernt werden können
        this.cleanUpTransitionClasses = this.cleanUpTransitionClasses.bind(this);
    }

    connectedCallback() {
        // Listener hinzufügen (werden im disconnectedCallback aufgeräumt)
        this.transitionContainer.addEventListener('transitionend', this.cleanUpTransitionClasses);
        this.transitionContainer.addEventListener('transitioncancel', this.cleanUpTransitionClasses);

        if (!this.dataset.name || !this.dataset.type) {
            console.warn('[BooxTransition] Keine Transition definiert. data-name oder data-type fehlen.');
            return;
        }

        // Parameter sicher verarbeiten
        this.setParams();
        this.initTransitionClasses();
        
        this.nextFrame(5).then(() => this.updateTransitionClasses());
    }

    disconnectedCallback() {
        // Memory Leaks verhindern
        this.transitionContainer.removeEventListener('transitionend', this.cleanUpTransitionClasses);
        this.transitionContainer.removeEventListener('transitioncancel', this.cleanUpTransitionClasses);
    }

    attributeChangedCallback(attName, oldValue, newValue) {
        if (oldValue === newValue) return;

        if (attName === 'data-params') {
            this.setParams();
        }

        if (this.isConnected) {
            this.refreshTransition();
        }
    }

    async refreshTransition() {
        if (this.transitionNotTriggered) {
            console.log(`[transition][refreshTransition] starting transition`);
            this.transitionNotTriggered = false;
            await this.nextFrame();
            this.transitionNotTriggered = true;
            this.initTransitionClasses();
            await this.nextFrame();
            this.updateTransitionClasses();
        }
    }

    initTransitionClasses() {
        this.transitionContainer.classList.add(`${this.dataset.name}-${this.dataset.type}-start`);
    }

    updateTransitionClasses() {
        // Custom Event abfeuern anstelle von eval() Callback
        this.dispatchEvent(new CustomEvent('before-transition', { bubbles: true, composed: true ,detail: 'transition'}));
        console.log('[updateTransitionClasses] emited before-transition')
        const { name, type } = this.dataset;
        this.transitionContainer.classList.add(`${name}-${type}`);
        this.transitionContainer.classList.replace(`${name}-${type}-start`, `${name}-${type}-end`);
    }

    cleanUpTransitionClasses(event) {
        // Sicherstellen, dass das Event wirklich vom Container kommt 
        // und nicht von einem Kind-Element herausgebubbelt ist
        if (event && event.target !== this.transitionContainer) return;

        const { name, type } = this.dataset;
        this.transitionContainer.classList.remove(`${name}-${type}`, `${name}-${type}-end`);
        
        // Custom Event abfeuern
        this.dispatchEvent(new CustomEvent('after-transition', { bubbles: true, composed: true, detail: 'transition' }));
        console.log('[cleanUpTransitionClasses] emited after-transition')
    }

    setParams() {
        if (!this.dataset.params) return;

        try {
            // JSON.parse ist der sichere Weg, um Objekte aus Strings zu lesen
            const paramsObj = JSON.parse(this.dataset.params);
            Object.entries(paramsObj).forEach(([cssVar, val]) => this.setCSSVar(cssVar, val));
        } catch (error) {
            console.error('[PageTransition] Ungültiges JSON in data-params:', error);
        }
    }

    setCSSVar(name, value) {
        const cssVarName = '--' + name.replace(/([A-Z])/g, '-$1').toLowerCase();
        this.style.setProperty(cssVarName, value);
    }

    nextFrame(count = 2) {
        return new Promise(resolve => {
            const step = () => {
                count -= 1;
                if (count > 0) requestAnimationFrame(step);
                else requestAnimationFrame(resolve);
            }
            requestAnimationFrame(step);
        });
    }
}

customElements.define('page-transition', PageTransition);
