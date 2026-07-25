export default (recipe) => `
<div class="card">
    <form data-id="${recipe.result.id}">
        <input type="submit" value="cancel">
    </form>

    <div class="card-content ${recipe.result.typeface}" >
        <h1><a href="/details?title=${recipe.result.title ?? recipe.result.name}&url=${recipe.result.link}&typeface=${recipe.result.typeface}" data-link data-callback="closeSidebar" >${recipe.result.title ?? recipe.result.name}</a></h1>
        <div class="info-box">
            ${recipe.result.prepTime ?`
                <div>
                    <h2>Vorbereitung</h2>
                    <span> <small>${recipe.result.prepTime}</small></span>
                </div>`:''
            }
            ${recipe.result.cookTime ?`
                <div>
                    <h2>Kochzeit</h2>
                    <span> <small>${recipe.result.cookTime}</small></span>
                </div>`:''
            }
            ${recipe.result.totalTime ?`
                <div>
                    <h2>Gesamtzeit</h2>
                    <span> <small>${recipe.result.totalTime}</small></span>
                </div>`:''
            }
        </div>
    </div>
</div>
`