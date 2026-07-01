import AbstractView from "./AbstractView.js";
import FavoritesDB from "../services/recipeCache.js";
import favEntry from '../templates/recipeFavoriteEntry.js';

export default class extends AbstractView {
  async getHtml() {
    return `
<transition-container id="sidebar-container" data-params='{"enter":{"name":"slide-left"},"leave":{"name":"slide-left"}}' data-prevent-default>
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
    btnCloseSidebar.onclick = tc.hide;
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