export default function LearningSection() {
  return (
    <section className="flex flex-col lg:flex-row items-center gap-10 px-6 py-20 max-w-6xl mx-auto text-left">
      <div className="lg:w-1/2">
        <h3 className="text-white text-sm uppercase mb-2">
          Des ressources pour tous les niveaux
        </h3>
        <h2 className="text-6xl font-bold">
          <span className="text-primary">Apprenez</span> et{" "}
          <span className="text-primary">progressez</span>
        </h2>
        <p className="mt-4 text-white">
          Que vous débutiez en développement web ou que vous soyez un expert
          cherchant à approfondir vos connaissances, nous vous proposons des
          tutoriels, guides et bonnes pratiques pour apprendre efficacement.
        </p>
        <button className="mt-6 text-white hover:underline">
          Explorer les ressources →
        </button>
      </div>
      <img
        src="src\assets\home\mokup.png"
        alt="Mockup 2"
        className="w-full max-w-md rounded-md shadow-lg"
      />
    </section>
  );
}
