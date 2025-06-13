module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          700: '#2F855A', // Dark green
          600: '#38A169', // Medium green
          500: '#48BB78', // Light green
        },
        beige: {
          100: '#F5F5DC', // Light beige
        },
        brown: {
          700: '#795548', // Dark brown
          600: '#8D6E63', // Medium brown
        }
      }
    },
  },
  plugins: [],
}
