// Zeigt eine Toast-Nachricht an
export function toast (title = '', message = '', color = 'black') {
    const errorEvent = new CustomEvent("toast", {
        detail: {
            color: color,
            title: title,
            text: message
        }
    });
    document.body.dispatchEvent(errorEvent);

}

// Gibt eine zufällige Farbe und typeface zurück
const colors = ['purple','orange','green','yellow','silver-blue','brick-red'];
const typefacesLarge = ['corben-nobile','droid','arvo-pt-sans','alerta-crimson','ubuntu-vollkorn','molengo-lekton','lobster-cabin'];
const typefacesSmall = ['allan-cardo','dancing-script-josefin','raleway-goudy-bookletter']

function colorDice() {
  let lastColorInd = 0, colorInd = 0;
  return function (param) {
    while (lastColorInd === colorInd) {
      colorInd = Math.round(Math.random()*5);
    }
    lastColorInd = colorInd;
    return colors[colorInd] 
  }
}

export const getRandomColor = colorDice ()

function typefaceDice () {
  let lastIndex=0,index=0;
  return function (title) {
    if (title.length > 30) {
      while (lastIndex === index)
        index = Math.round(Math.random()*2)
      lastIndex = index
      return typefacesSmall[index]
    } else {
      while (lastIndex === index)
        index = Math.round(Math.random()*6)
      lastIndex = index
      return typefacesLarge[index]
    }
  }
}

export const getRandomTypeface = typefaceDice ()
