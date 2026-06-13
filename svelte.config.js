import adapter from "@sveltejs/adapter-static";

export default {
  onwarn: (warning, handler) => {
    if (warning.code === "a11y_label_has_associated_control") return;
    handler(warning);
  },
  kit: {
    paths: {
      base: process.env.BASE_PATH || "",
    },
    adapter: adapter({
      pages: "dist",
      assets: "dist",
      fallback: "index.html",
    }),
  },
};
