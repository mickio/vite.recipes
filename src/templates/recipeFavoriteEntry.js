export default (recipe) => `
<div class="card">
    <form data-id="${recipe.result.id}">
        <input type="submit" value="cancel">
    </form>

    <div class="card-content ${recipe.typeface}" >
        <h1>${recipe.result.title ?? recipe.result.name}</h1>
        <div class="info-box">
            ${recipe.result.prepTime != null ?`
                <div>
                    <h2>Vorbereitung</h2>
                    <span> <small>${recipe.result.prepTime}</small></span>
                </div>`:''
            }
            ${recipe.result.cookTime !=  null ?`
                <div>
                    <h2>Kochzeit</h2>
                    <span> <small>${recipe.result.cookTime}</small></span>
                </div>`:''
            }
            ${recipe.result.totalTime != null ?`
                <div>
                    <h2>Gesamtzeit</h2>
                    <span> <small>${recipe.result.totalTime}</small></span>
                </div>`:''
            }
        </div>
    </div>
</div>
`