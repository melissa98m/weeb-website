export default function TrendsSection() {
  return (
    <section className="px-6 py-20 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10">
      <div className="w-full max-w-xs flex justify-center">
        <img
          src="src\assets\home\Shapes.svg"
          alt="Visuel geometrique"
          className="w-60 h-60 animate-spin"
        />
      </div>
      <div className="lg:w-1/2 text-center lg:text-left">
        <h3 className="text-white text-sm uppercase mb-2">
          Le web, un écosystème en constante évolution
        </h3>
        <h2 className="text-6xl font-bold">
          Restez informé des dernières{" "}
          <span className="text-primary">tendances</span>
        </h2>
        <p className="mt-4 text-white">
          Chaque semaine, nous analysons les nouveautés du web : frameworks
          émergents, bonnes pratiques SEO, accessibilité, et bien plus encore.
          Ne manquez aucune actualité du digital !
        </p>
        <button className="mt-6 text-white hover:underline">
          Lire les articles récents →
        </button>
      </div>
    </section>
  );
}
