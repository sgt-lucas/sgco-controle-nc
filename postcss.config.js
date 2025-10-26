// Caminho: postcss.config.js (Atualizado para Mantine + Tailwind)
module.exports = {
  plugins: {
    'postcss-preset-mantine': {}, // Adiciona o preset do Mantine
    'tailwindcss/nesting': {}, // Necessário para aninhamento se usar Tailwind
    tailwindcss: {}, // Mantém o Tailwind
    autoprefixer: {}, // Mantém o Autoprefixer
  },
};