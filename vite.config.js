import { defineConfig } from "vite";

export default defineConfig({
	server: {
		'/api': {
			target: 'http://localhost:5000',
			changeOrigin: true,
			// rewrite: path => path.replace()
			
		}
	},
	build: {
        // Zielverzeichnis festlegen (Standard ist 'dist')
        outDir: '../py.recipes.server/flask.recipes/app/frontend/dist',
    
        // Minifizierung ist standardmäßig aktiviert ('esbuild' ist blitzschnell).
        // Alternativ ginge auch 'terser' (benötigt: npm i -D terser)
        minify: 'esbuild',
    
        // Leert das Zielverzeichnis vor jedem Build, damit keine alten Dateien übrig bleiben
        emptyOutDir: true,
    },
    esbuild: {
        drop: ['console', 'debugger'],
    },
});

