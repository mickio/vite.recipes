
// @ts-nocheck
/*	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { merkliste, merklisteButtonTouched } from '$lib/utils';
	import Toast from './Toast.svelte';
    export let recipeData;
	import { jsPDF } from "jspdf";

	let inMerkliste, message;
    
    const recipeHost = new URL(recipeData.link).host;

	const generatePdf = () => {
		const doc = new jsPDF('p', 'mm', 'a4');
		const margin = 40;
		const pageWidth = doc.internal.pageSize.getWidth();
		const usableWidth = pageWidth - (margin * 2);
		let y = margin;

		// Title
		doc.setFontSize(22);
		const titleLines = doc.splitTextToSize(recipeData.title, usableWidth);
		doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
		y += (titleLines.length * 10);

		y+= 10;

		// Ingredients
		if (recipeData.ingredients?.length) {
			doc.setFontSize(16);
			doc.text('Zutaten', margin, y);
			y += 8;
			doc.setFontSize(12);
			const ingredientsText = recipeData.ingredients.map(i => `• ${i.replace(/<[^>]+>/g, '')}`).join('\n');
			const ingredientLines = doc.splitTextToSize(ingredientsText, usableWidth);
			doc.text(ingredientLines, margin, y);
			y += (ingredientLines.length * 5); // Adjust spacing based on lines
		}

		y+= 10;

		// Instructions
		if (recipeData.instructions?.length) {
			doc.setFontSize(16);
			doc.text('Zubereitung', margin, y);
			y += 8;
			doc.setFontSize(12);
			
			recipeData.instructions.forEach((instruction, index) => {
				if (y > 270) { // crude page break
					doc.addPage();
					y = margin;
				}
				const instructionText = `${index + 1}. ${instruction.replace(/<[^>]+>/g, '')}`;
				const instructionLines = doc.splitTextToSize(instructionText, usableWidth);
				doc.text(instructionLines, margin, y);
				y += (instructionLines.length * 5) + 5; // spacing between instructions
			});
		}

		doc.save(`${recipeData.title.replace(/ /g, '_')}.pdf`);
	}

	function replaceImage() {
		recipeData.image = recipeData.thumbnail.src;
	}

	const blinkButtonMerklisteAndStoreMerkliste = _ => {
		localStorage.merkliste = JSON.stringify($merkliste);
		$merklisteButtonTouched = true;
		setTimeout(_=> $merklisteButtonTouched = false,200);
	}
	
	const addToMerkliste = recipe => {
		$merkliste[$merkliste.length] = recipe;
		blinkButtonMerklisteAndStoreMerkliste()
	}
	const removeFromMerkliste = recipe => {
		$merkliste = $merkliste.filter(({link}) => link !== recipe.link);
		blinkButtonMerklisteAndStoreMerkliste()
	}
	function toggleMerklisteAddRemove(evt){
		inMerkliste = !inMerkliste;
		if (inMerkliste) addToMerkliste(recipeData)
		else removeFromMerkliste(recipeData)
	}

	$: inMerkliste = $merkliste?.map(({link}) => link).includes(recipeData.link);

{#if message}
	<Toast>{message}</Toast>
`}
*/

export default (recipeData) => `<article>
    <figure>
        <img ${recipeData.image?.src?`src="${recipeData.image.src}"`:recipeData.image?.srcset?`srcset="${recipeData.image.srcset}"`:`src="${recipeData.thumbnail || ''}"`} alt=${recipeData.title??'Ohne Titel'}>
        <figcaption>
			<a href="${recipeData.url??''}" target="_blank" rel="noopener noreferrer"><b>${new URL(recipeData.url).host}</b></a>
		</figcaption>
    </figure>
    <section class=${recipeData.typeface}>
        <h1 class="is-smaller-mobile">${recipeData.title??''}</h1>
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
                <transition-container class="ingredients" data-transition="slide-left">
                    ${recipeData.ingredients.map( ingredient => 
                        `<p>${ingredient}</p>`).join('')
                    }
                </transition-container>
            `:''}
            ${recipeData.instructions?.length ? `
                <div class="instructions is-flex-column-scroll-snap-mobile">
                    ${recipeData.instructions.map((instruction) => `
                    <p class="instruction is-flexbox-scroll-snap-mobile">${instruction}</p>
                    `).join('')}
                </div>
            `:''}
		</div>
    </section>
</article>  
`