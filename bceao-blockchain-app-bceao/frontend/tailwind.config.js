module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        bceao: {
          primary: '#004A94',    // Bleu BCEAO
          secondary: '#FFB612',  // Jaune BCEAO
          light: '#F5F5F5',     // Gris clair pour le fond
          dark: '#003666',      // Bleu foncé
          marron: '#a57b63',
          'light-blue': '#E6F0F9', // Bleu très clair pour le fond
          'gray-light': '#F8FAFC', // Gris très clair pour le fond
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-bceao': 'linear-gradient(to bottom, var(--bceao-light), white)',
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
};