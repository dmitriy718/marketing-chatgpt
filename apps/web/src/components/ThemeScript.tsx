export function ThemeScript() {
  const code = `(() => {
  try {
    const stored = localStorage.getItem("theme");
    const theme =
      stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.dataset.theme = theme;
  } catch (_) {}
})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
