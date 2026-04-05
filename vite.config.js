import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [{
            name: 'move-script-to-body',
            transformIndexHtml(html) {
                // Mencari tag script module lengkap dengan atribut apa pun yang ada di dalamnya
                const scriptTagRegex = /<script type="module"[\s\S]*?><\/script>/;
                const match = html.match(scriptTagRegex);

                if (match) {
                    const fullScriptTag = match[0]; // Ini berisi seluruh tag script yang ditemukan
                    return html
                        .replace(fullScriptTag, '') // Hapus dari tempat asal (head)
                        .replace('</body>', `${fullScriptTag}</body>`); // Pindah ke sebelum </body>
                }
                return html;
            }

        },

        createHtmlPlugin({
            minify: true, // Ini yang akan melakukan minifikasi saat build
        }),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        }
    },

    build: {
        outDir: 'dist',
        assetsDir: 'assets', // Direktori untuk aset di dalam outDir
        sourcemap: 'hidden', // 'inline', 'hidden', atau false
        minify: 'terser', // atau 'esbuild' (lebih cepat, tapi kurang optimal)
        terserOptions: {
            compress: {
                drop_console: true, // Hapus console.log di produksi
                drop_debugger: true,
            },
        },
        // Batas ukuran (dalam byte) untuk aset yang akan di-inline sebagai base64
        assetsInlineLimit: 4096, // 4 kB
        rollupOptions: {
            output: {
                // Mengelompokkan file hasil build ke dalam folder yang berbeda.
                assetFileNames: (assetInfo) => {
                    let extType = assetInfo.name.split('.').at(1);
                    if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
                        extType = 'images';
                    } else if (/css/i.test(extType)) {
                        extType = 'styles';
                    } else if (/woff?2|ttf|otf/i.test(extType)) {
                        extType = 'fonts';
                    }
                    return `assets/${extType}/[name]-[hash][extname]`;
                },
                // Memecah vendor (dependencies) ke dalam chunk terpisah
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return id.toString().split('node_modules/')[1].split('/')[0].toString();
                    }
                },
                chunkFileNames: 'assets/js/[name]-[hash].js',
                entryFileNames: 'assets/js/[name]-[hash].js',
            },
        },
        // Batas ukuran chunk (dalam kB) sebelum Vite memberikan peringatan.
        chunkSizeWarningLimit: 1000,
    },

    // Konfigurasi terkait CSS.
    css: {
        // Opsi untuk CSS Preprocessors seperti SASS, LESS, Stylus.
        preprocessorOptions: {
            scss: {
                // Menyuntikkan variabel global atau mixin SASS ke semua file SCSS.
                // Jadi Anda tidak perlu @import manual di setiap file.
                additionalData: `@import "@/styles/variables.scss";`,
            },
        },
        // Konfigurasi untuk CSS Modules.
        modules: {
            localsConvention: 'camelCaseOnly',
        },
        devSourcemap: true, // Aktifkan sourcemap CSS saat development
    },

    // Mengatur pre-bundling dependensi oleh esbuild
    optimizeDeps: {
        // Cegah Vite melakukan pre-bundle pada package tertentu
        exclude: ['vite-plugin-html'],
    }
});