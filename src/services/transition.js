const styles = `
:host {
    --duration: .5s;
    --timing-function: ease-in;
    --box-positionX: 50vw;
    --box-positionY: 50vh;
    --box-width: 0;
    --box-height: 0;
    --scrollX:0;
    --scrollY:0;
    --x-start: 100vw;
    --x-start-inv: -100vw;
    --x-end: 0;
    --y-start:-120px;
    --y-end: 0;
    --display-at-start: none;
}
:host {
  display: block;
}
:host(:state(hidden)) {
    display: none !important;
}
:host(:not(:state(start)):not(:state(end))) {
  display: var(--display-at-start) !im;
}

:host([data-transition="enlarge"]:state(enter):state(start)), :host([data-transition="minimize"]:state(leave):state(end)) {
  transform: translate(calc(var(--box-positionX) + var(--scrollX)),calc(var(--box-positionY) - var(--scrollY)));
  width: var(--box-width) !important;
  height: var(--box-height) !important;
  opacity: 0;
}
:host([data-transition="enlarge"]:state(enter):state(end)), :host([data-transition="minimize"]:state(leave):state(start)) {
  transition: all var(--duration) ease-in;
  transform: translate(0,0);
  width: 100vw;
  height: 100vh;
  opacity: 1;
}
:host([data-transition="flyaway"]:state(leave):state(start)), :host([data-transition="entry"]:state(leave):state(start)) {
    opacity: 1;
    transform: scale3d(1.,1.,1.) translate(0,0)
}
:host([data-transition="flyaway"]:state(leave):state(end)), :host([data-transition="entry"]:state(leave):state(end)) {
    opacity: 0;
    transform: scale3d(3.0,3.0,3.0) translate(200px,20px);
    transition: all var(--duration) cubic-bezier(0.4, 0.2, .9, 1);
}
/* slide left, slide right */
:host([data-transition="slide-down"]), :host([data-transition="slide-left"]), :host([data-transition="slide-right"]) {
  transition: transform var(--duration) cubic-bezier(0.68, .55, 0.265, 1);
}
:host([data-transition="slide-down"]:state(enter):state(start)),:host([data-transition="slide-left"]:state(leave):state(end)) {
  transform: translateY(var(--y-start));
}
:host([data-transition="slide-down"]:state(enter):state(end)),:host([data-transition="slide-left"]:state(leave):state(start)) {
  transform: translateY(var(---end));
}
:host([data-transition="slide-left"]:state(enter):state(start)),:host([data-transition="slide-left"]:state(leave):state(end)) {
  transform: translateX(var(--x-start));
}
:host([data-transition="slide-left"]:state(enter):state(end)),:host([data-transition="slide-left"]:state(leave):state(start)) {
  transform: translateX(var(--x-end));
}
:host([data-transition="slide-right"]:state(enter):state(start)),:host([data-transition="slide-right"]:state(leave):state(end)) {
  transform: translateX(var(--x-start-inv));
}
:host([data-transition="slide-right"]:state(enter):state(end)),:host([data-transition="slide-right"]:state(leave):state(start)) {
  transform: translateX(var(--x-end));
}

/* zoom */
:host([data-transition="zoom"]:state(enter)) {
  transition: transform var(--duration) ease-in, opacity var(--duration) ease-in;
}
:host([data-transition="zoom"]:state(leave)) {
  transition: transform var(--duration) ease-out, opacity var(--duration) cubic-bezier(1, 0, 0, 1);
}
:host([data-transition="zoom"]:state(enter):state(start)),:host([data-transition="zoom"]:state(leave):state(end)) {
  transform: scale3d(1.2,1.2,1.2) translate(-.05em,-.05em);
  opacity:0;
}
:host([data-transition="zoom"]:state(enter):state(end)), :host([data-transition="zoom"]:state(leave):state(start)) {
  transform: scale3d(1.,1.,1) translate(0,0);
  opacity: 1;
}
/* fade */
:host([data-transition="fade"]:state(enter)), :host([data-transition="fade"]:state(leave)) {
  transition: opacity var(--duration) ease-out;
}
:host([data-transition="fade"]:state(enter):state(end)), :host([data-transition="fade"]:state(leave):state(start)) {
  opacity: 1;
}
:host([data-transition="fade"]:state(leave):state(end)), :host([data-transition="fade"]:state(enter):state(start)) {
  opacity: 0;
}
`

class Transition extends HTMLElement {

    static get observedAttributes() { 
        return ['data-params','data-transition']; 
    }

    static get transitions() {
        return ['enlarge','flyaway','slide-left','slide-right','zoom','fade']
    }
    
    get transition () {
      return this.dataset.transition
    }
    
    set transition (name) {
      // console.log('[set transition] transition style is now', name)
        this.dataset.transition = name
    }

    constructor(options) {
      super()
      
      // bind to custom element
      /* this.toggleStart = this.toggleStart.bind(this)
      this.toggleEnd = this.toggleEnd.bind(this)
      this.enter = this.enter.bind(this)
      this.toggleLeave = this.toggleLeave.bind(this)
      this.run = this.run.bind(this)*/
      this.clear = this.clear.bind(this)
      this.toggle = this.toggle.bind(this)
      this.show = this.show.bind(this)
      this.hide = this.hide.bind(this)
  
      // Init shadowRoot 
      this.attachShadow({mode:'open'}); 

      // Adopt css styles
      const transitionStyles = new CSSStyleSheet();
      transitionStyles.replaceSync(styles);
      this.shadowRoot.adoptedStyleSheets = [transitionStyles]; 
      
      // Use internal states to control transitions
      this._internals = this.attachInternals()
      // console.log('### C O N S T R U C T E D')
    }

    toggleStart () {
        this._internals.states.delete('end')
        this._internals.states.add('start')
    }

    toggleEnd () {
        this._internals.states.delete('start')
        this._internals.states.add('end')
    }

    toggleEnter () {
      if (!this.enterName)
        return false;
      this.transition = this.enterName;
      this.setCSSHostVars(this.enterParams || {});
      this._internals.states.delete('leave')
      this._internals.states.add('enter')
      return true
    }

    toggleLeave () {
      if (!this.leaveName)
        return false
      this.transition = this.leaveName
      this.setCSSHostVars(this.leaveParams || {})
      // console.log('set leave params')
      
      this._internals.states.delete('enter')
      this._internals.states.add('leave')
      return true
    }

    run(enterLeave) {
      if (!this[enterLeave]())
        return false
       // this.addEventListener('transitionstart',() => console.log('started transition'),{once:true})
      this.toggleStart()
      // console.log(`[transition][${this.id?this.id:''}][run] starting transition`,enterLeave,this.transition);
      void this.offsetHeight;// reflow erzwingen...
      this.toggleEnd()
      return true
    }

    toggle () {
        if (!this.isStart)
            this.toggleStart()
        if (this.entered)
            this.hide()
        else 
            this.show()
    }
    
    clear () {
      this._internals.states.clear()
    }
    
    get isEnd() { return this._internals.states.has('end') }
    
    get isStart() { return this._internals.states.has('start') }
    
    get entered() { return this._internals.states.has('enter') }

    async remove () {
      // console.log('[transition][remove] starting transition')
      if (!this.run('toggleLeave')) {
        super.remove();
        return
      }
      await evtTransitionEnd(this);
      // console.log('[transition][remove] ready to remove',this);
      super.remove()
      // console.log('done.')
    }
    
    async hide () {
      if (this.run('toggleLeave')) 
        await evtTransitionEnd(this);
      this._internals.states.add('hidden');
    }
    
    async show () {
      this._internals.states.delete('hidden');
      this.run('toggleEnter')
    }

    connectedCallback() {
      // console.log('### C O N N E C T E D')
      this.shadowRoot.innerHTML = '<slot/>';
      // console.log('[connectedCallback] preventDefault ?','preventDefault' in this.dataset);
      if ('preventDefault' in this.dataset)   {
        // console.log(`[transition][connectedCallback] prevent default`)
        this._internals.states.add('hidden');
      }
      else if (document.readyState==='complete'){
        // console.log(`[transition][${this.id??''}][connectedCallback] start transition ${this.dataset.params?.enter?.name}...`)
        this.show();
      }
      else {
        // console.log('[transition][connectedCallback] readyState noch nicht complete.');
        const transition = this;
        document.addEventListener('DOMContentLoaded',transition.show,{once:true})
      }
    }
    
    attributeChangedCallback (attName, oldValue,newValue) {
      // console.log(`att "${attName}" changed from "${oldValue}" to "${newValue}"`)
      if (attName === 'data-visible-at-start') {
        this.style.setProperty("--visible-at-start","block")
      }
      else if (attName === 'data-params') {
        const params = JSON.parse(newValue)
        if (params.enter) {
          this.enterName = params.enter.name
          delete params.enter.name
          this.enterParams = params.enter
        }
        if (params.leave) {
          this.leaveName = params.leave.name
          delete params.leave.name
          this.leaveParams = params.leave
        }
      } 
      else if (attName === 'data-transition') {
        // console.log('setting enterName and leaveName')
        this.enterName = newValue;
        this.leaveName = newValue
      }
    }
    
    setCSSHostVars (opts) {
      Object.entries(opts).forEach(([cssVar, val]) => {
        const cssVarName = '--' + cssVar.replace(/[A-Z]/g, '-$&').toLowerCase()
        this.style.setProperty(cssVarName, val)
      })
    }

}

customElements.define('transition-container',Transition);
// console.log('[transition.to js] custom element tc defined?',window.customElements.getName(Transition));
export const evtTransitionEnd = (tc) => new Promise(resolve => {
    const removeHandler = (evt) => {
    if (evt && evt.target !== tc) return; 
    let timeoutId;
    // console.log('[evtTransitionEnd] catched transitionend')
      if (tc.getAnimations().length === 0) {
        // console.log('[evtTransitionEnd] removing evt listeners');
        tc.removeEventListener('transitionend',removeHandler);
        tc.removeEventListener('transitioncancel',removeHandler);
        clearTimeout(timeoutId);
        resolve()
      } 
    }
    tc.addEventListener('transitionend',removeHandler)
    tc.addEventListener('transitioncancel',removeHandler)
    let timeout = getComputedStyle(tc).transitionDuration
    timeout *= 1000
    setTimeout(removeHandler,timeout+50)
})
