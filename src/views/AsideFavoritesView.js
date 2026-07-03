import AbstractView from "./AbstractView.js";
import FavoritesDB from "../services/recipeCache.js";
import favEntry from '../templates/recipeFavoriteEntry.js';

export default class extends AbstractView {
  async getHtml() {
    return `
<transition-container id="sidebar-container" data-params='{"enter":{"name":"slide-left","xStart":"800px"},"leave":{"name":"slide-left"}}' data-prevent-default style="--aside-width: ${Math.min(800,screen.width)}px; --aside-min-width: ${Math.min(600,screen.width)}px">
    <div class="panel-header">
        <icon>search</icon>
        <input id="search-favorites" type="search" placeholder="Suche in der Merkliste">
        <icon id="close-sidebar">close</icon>
    </div>
    <div class="panel-content"></div>
    <div class="footer">
        <div class="load">
            <a download="Merkliste.json">
                <div class="download">Merkliste speichern</div>
            </a>
            <form class="upload">
                <label for="upload">Merkliste hochladen</label>
                <input id="upload" type="file" accept="application/json,.json">
            </form>
        </div>
    </div>
</transition-container>
    `
  }
  
  afterRender(fragment) {
    const favoritesDB = new FavoritesDB();
    const tc = this.$('sidebar-container');
    const suchfeld = this.$('search-favorites');
    const btnCloseSidebar = this.$('close-sidebar');
    const favContainer = fragment.querySelector('div.panel-content');
    const btnDownloadFav = fragment.querySelector('div.load > a');
    const btnUploadFav = fragment.querySelector('#upload');
    const generateFavoritesList = (term) => favoritesDB.filterAllFavorites(term).map(favEntry).join('\n');

    // Delete favorite status on cancel button click
    favContainer.onsubmit = (evt) => {
        evt.preventDefault();
        const btn = evt.target;
        console.log('[AsideFavoritesView][afterRender] delete favorite for',btn.dataset.id)
        favoritesDB.toggleFavorite(btn.dataset.id);
        favContainer.innerHTML = generateFavoritesList(suchfeld.value);
        // Falls das Rezept gerade in der Detailansicht angezeigt wird, den Favoriten-Button dort auch updaten
        const currentFavoriteToggler = document.querySelector(`#toggle-favorite[data-id="${btn.dataset.id}"]`);
        if (currentFavoriteToggler) 
            currentFavoriteToggler.value = 'favorite_outlined';
    };
    // Filtern der Liste bei Eingabe im Suchfeld
    suchfeld.oninput = () => favContainer.innerHTML = generateFavoritesList(suchfeld.value);
    // sidebar close
    btnCloseSidebar.onclick = closeSidebar;
    // ungefilterte Liste
    favContainer.innerHTML = generateFavoritesList();
    // download favorites 
    btnDownloadFav.href = favoritesDB.exportFavsAsObjectURL()
    // upload Favorites 
    btnUploadFav.onchange = ({target}) => target
        .files[0]
        .text()
        .then(favoritesDB.importFavsFromJSON)
        .then(() => favContainer.innerHTML = generateFavoritesList(suchfeld.value));
   // update favlist
    document.body.addEventListener('favlistchanged',() => favContainer.innerHTML = generateFavoritesList(suchfeld.value));
  }
}

// Für die Sidebar: Wischbewegungen erkennen
let touchstart;

const setTouchstart = ({ changedTouches }) => touchstart = changedTouches[0]

const onswipe = function({ changedTouches }) {
    if (!touchstart) return;
    const sidebar = document.getElementById('sidebar-container');
    const cT = changedTouches[0];
    const inSensibleOpenArea = Math.abs(screen.width -25 - touchstart.clientX) < 25; // Wischbewegung vom rechten Rand
    const inSensibleCloseArea = Math.abs(touchstart.clientX - 25 - sidebar.getBoundingClientRect().x) < 25; // vom linken sidebar Rand
    const dx = cT.clientX - touchstart.clientX;
    const dy = cT.clientY - touchstart.clientY;
    // console.log('[onswipe] dx,dy',dx,dy,'inSensibleOpenArea',inSensibleOpenArea,'inSensibleCloseArea',inSensibleCloseArea)
 
    if (sidebar.isHidden && inSensibleOpenArea && dx < -50 && Math.abs(dy) < 20) // ausfahren: Wischbewegung von links nach rechts
        openSidebar();
    else if(!sidebar.isHidden && inSensibleCloseArea && dx > 50 && Math.abs(dy) < 20) // einfahren: Wischbewegung von rechts nach links
        closeSidebar();
    touchstart=null;
}

document.body.addEventListener('touchstart', setTouchstart, {passive:true});
document.body.addEventListener('touchend', onswipe, {passive:true});
document.body.addEventListener('touchcancel', onswipe, {passive:true});

const openSidebar = () => {
    const sidebar = document.getElementById('sidebar-container');
    const navbar = document.getElementById('nav-container');
    !navbar.isHidden && navbar.hide(); // navbar schließen
    sidebar.isHidden && sidebar.show();
}

const closeSidebar = () => {
    const sidebar = document.getElementById('sidebar-container');
    const navbar = document.getElementById('nav-container');
    navbar.isHidden && navbar.show(); // navbar öffnen
    !sidebar.isHidden && sidebar.hide();
}
