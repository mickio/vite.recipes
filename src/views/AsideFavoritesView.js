import AbstractView from "./AbstractView.js";
import favoritesDB from "../services/recipeCache.js";
import favEntry from '../templates/recipeFavoriteEntry.js';

export default class extends AbstractView {
  async getHtml() {
    return `
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
    `
  }
  
  afterRender(tc) {
     
     const suchfeld = document.getElementById('search-favorites');
     const btnCloseSidebar = document.getElementById('close-sidebar');
     const favContainer = tc.querySelector('div.panel-content');
     const btnDownloadFav = tc.querySelector('div.load > a');
     const btnUploadFav = tc.querySelector('#upload');
     const generateFavoritesList = (list) => list.map(favEntry).join('\n');
     
    // Suchfeld
    suchfeld.oninput = ({target}) => favContainer.innerHTML = generateFavoritesList(target.value);
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
        .then(importFavsFromJSON)
  }
}