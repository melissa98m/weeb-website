export default function HeroSection() {
  return (
    <section className="px-6 py-16 text-center max-w-5xl mx-auto">
      <h1 className="text-7xl md:text-5xl font-bold leading-tight">
        Explorez le <span className="text-primary">Web</span> sous toutes ses 
        <span className="underline decoration-primary underline-offset-8"> facettes</span>
      </h1>
      <p className="mt-4 text-white max-w-2xl mx-auto">
        Le monde du web évolue constamment, et nous sommes là pour vous guider à
        travers ses tendances, technologies et meilleures pratiques. Que vous
        soyez développeur, designer ou passionné du digital, notre blog vous
        offre du contenu de qualité pour rester à la pointe.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-secondary text-white px-6 py-2 rounded-md shadow">
          Découvrir les articles
        </button>
        <button className="border border-white px-6 py-2 rounded-md">
          S’abonner à la newsletter
        </button>
      </div>
      <img
        src="src\assets\home\mokup.png"
        alt="Mockup"
        className="mt-12 w-full max-w-5xl mx-auto rounded-md shadow-lg"
      />
    </section>
  );
}
