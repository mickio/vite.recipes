export default (recipe) => `
<div class="card">
    <form on:submit|preventDefault={removeRecipe}>
        <button type="submit">cancel</button>
    </form>
    <div class="card-content ${recipe.typeface}" on:click={selectRecipeTeaser}>
        <h1>${recipe.title}</h1>
        <div class="info-box">
            ${recipe.prepTime != null ?`
                <div>
                    <h2>Vorbereitung</h2>
                    <span> <small>${recipe.prepTime}</small></span>
                </div>`:''
            }
            ${recipe.cookTime !=  null ?`
                <div>
                    <h2>Kochzeit</h2>
                    <span> <small>${recipe.cookTime}</small></span>
                </div>`:''
            }
            ${recipe.totalTime != null ?`
                <div>
                    <h2>Gesamtzeit</h2>
                    <span> <small>${recipe.totalTime}</small></span>
                </div>`:''
            }
        </div>
    </div>
`