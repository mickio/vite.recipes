import { defineConfig } from "vite";

export default defineConfig({
	server: {
		'/api': {
			target: 'http://localhost:5000',
			changeOrigin: true,
			// rewrite: path => path.replace()
			
		}
	}
});

