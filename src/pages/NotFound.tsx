import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-4xl font-bold mb-4 text-inci-blue">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Página não encontrada</p>
        <a 
          href="/" 
          className="inline-flex items-center px-6 py-3 bg-inci-blue text-white rounded-lg hover:bg-inci-blue-dark transition-all duration-300 font-semibold"
        >
          🏠 Voltar ao Simulador
        </a>
      </div>
    </div>
  );
};

export default NotFound;
