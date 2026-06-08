export default (recipeData,index) => `
<article class="${recipeData.color}" data-index="${index??0}">
	<figure>
		<img src=${recipeData.image} alt=${recipeData.title}>
		<figcaption>
			<a href=${recipeData.link}>
				<b>${new URL(recipeData.link).host}</b>
			</a> 
		</figcaption>
	</figure>
	<div style="flex-grow: 6"></div>
	<div class="content ${recipeData.typeface}">
		<h1><a href="/details/${recipeData.title??'Ohne Titel'}?url=${recipeData.link}&title=${recipeData.title??'Ohne Titel'}" data-link>${recipeData.title??'Ohne Titel'}</a></h1>
	</div>
	<div style="flex-grow: 1"></div>
	<div class="${recipeData.typeface}">
        ${recipeData.description ?
		    `<p>${recipeData.description.slice(0,200)}</p>`:''
        }
	</div>
	<div style="flex-grow: 6"></div>
	<div class="info-box">
		${recipeData.prepTime ?
			`<div>
				<h2>Vorbereitung</h2>
				<span> <small>${recipeData.prepTime}</small></span>
			</div>`:''
		}
		${recipeData.cookTime ?
			`<div>
				<h2>Kochzeit</h2>
				<span> <small>${recipeData.cookTime}</small></span>
			</div>`:''
		}
		${recipeData.totalTime ?
			`<div>
				<h2>Gesamtzeit</h2>
				<span> <small>${recipeData.totalTime}</small></span>
			</div>`:''
		}
		${recipeData.yields ?
			`<div>
				<h2>Portionen</h2>
				<span> <small>${recipeData.yields}</small></span>
			</div>`:''
		}
	</div>
</article>
`