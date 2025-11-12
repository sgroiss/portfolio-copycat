module.exports = {
  content: ["./*.{html,js}", "components/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "sg-light-grey": "#fafafa",
        "sg-primary": "#040234",
      },
    },
    container: {
      center: true, // automatisch zentrieren
      padding: "1rem", // Standard-Innenabstand
      screens: {
        // Breakpoints für Container-Breiten
        sm: "600px",
        md: "728px",
        lg: "984px",
        xl: "1240px",
        "2xl": "1800px",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const weights = Array.from({ length: 17 }, (_, i) => 100 + i * 50); // 100–900
      const utils = Object.fromEntries(
        weights.map((w) => [
          `.wght-${w}`,
          { "font-variation-settings": `"wght" ${w}` },
        ])
      );
      addUtilities(utils);
    },
  ],
};
