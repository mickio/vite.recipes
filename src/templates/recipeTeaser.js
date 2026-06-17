export default (recipeData,index) => `
<article class="${recipeData.color}" data-index="${index??0}"> 
	<!--transition-container data-prevent-default data-transition="enlarge" style="height:fit-content;"-->
	<figure>
		<img src=${recipeData.thumbnail?.src} alt=${recipeData.title}>
		<figcaption>
			<a href="${recipeData.link|'#'}" target="_blank" rel="noopener noreferrer">
				<b>${new URL(recipeData.link).host}</b>
			</a> 
		</figcaption>
	</figure>
	<!--/transition-container-->
	<div style="flex-grow: 6"></div>
	<div class="content ${recipeData.typeface}">
		<h1><a href="/details/${encodeURIComponent(recipeData.title??'Ohne Titel')}?url=${recipeData.link}&color=${recipeData.color}&typeface=${encodeURIComponent(recipeData.typeface)}&thumbnail=${recipeData.thumbnail?.src ??''}&title=${encodeURIComponent(recipeData.title)}" data-link>${recipeData.title??'Ohne Titel'}</a></h1>
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