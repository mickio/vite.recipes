
export default (recipeData) => `
    <transition-container data-transition='{"enter":{"name":"fade","duration":"3s"}}'> 
        <div class="info-box">
            ${recipeData.prepTime ?`
                <div>
                    <h2>Vorbereitung</h2>
                    <span> <small>${recipeData.prepTime}</small></span>
                </div>
            `:''}
            ${recipeData.cookTime ?`
                <div>
                    <h2>Kochzeit</h2>
                    <span> <small>${recipeData.cookTime}</small></span>
                </div>
            `:''}
            ${recipeData.totalTime ?`
                <div>
                    <h2>Gesamtzeit</h2>
                    <span> <small>${recipeData.totalTime}</small></span>
                </div>
            `:''}
            ${recipeData.recipeYield ?`
                <div>
                    <h2>Portionen</h2>
                    <span><small>${recipeData.recipeYield}</small></span>
                </div>
            `:''}
        </div>
        <div class="content">
            ${recipeData.ingredients?.length ? `
                <div class="ingredients" data-transition="slide-left">
                    ${recipeData.ingredients.map( ingredient => 
                        `<p>${ingredient}</p>`).join('')
                    }
                </div>
            `:''}
            ${recipeData.instructions?.length ? `
                <div class="instructions is-flex-column-scroll-snap-mobile">
                    ${recipeData.instructions.map((instruction) => `
                    <p class="instruction is-flexbox-scroll-snap-mobile">${instruction}</p>
                    `).join('')}
                </div>
            `:''}
		</div>
	</transition-container>
`