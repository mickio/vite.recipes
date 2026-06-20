import { router } from "./router.js";
import "./services/transition.js";

const ondocloaded = async () => {
  document.removeEventListener("DOMContentLoaded",ondocloaded);
  
  // 1. Router das erste Mal anwerfen
  console.log('[app.js] DOM content loaded, call for routing');
  const initCompleted = router.route();
  
  // navbar aufklappen
  const navbar = document.getElementById('navbar');
  await initCompleted;
  navbar.classList.remove('is-hidden');
  navbar.show();
  
  // 3. linker Button (refresh oder back)
  const refreshOrBack = document.getElementById("btn-refresh-or-back")
  refreshOrBack.closest('form').addEventListener("submit", (evt) => {
    evt.preventDefault();
    router.navigateTo("/");
  });

  // 4. Das Suchfeld in der Kopfzeile kontrollieren
  document.getElementById("search-form").addEventListener("submit", e => {
    e.preventDefault();
    const query = document.getElementById("search-input").value.trim();
    if (query) {
      router.navigateTo(`/search?q=${encodeURIComponent(query)}`);
      refreshOrBack.value="west"
    }
  });
};
document.addEventListener("DOMContentLoaded", ondocloaded, { once: true });