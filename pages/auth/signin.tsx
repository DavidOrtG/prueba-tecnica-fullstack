import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/hooks/useAuth';
import Navigation from '../../components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Github, ArrowRight } from 'lucide-react';

export default function SignIn() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (session && !loading) {
      router.push('/');
    }
  }, [session, loading, router]);

  const handleGitHubSignIn = () => {
    window.location.href = '/api/auth/signin/github';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (session) {
    return null; // Redirigirá automáticamente
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
              <CardDescription>
                Accede al Sistema de Gestión Financiera
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-gray-600 mb-6">
                <p>Para efectos de prueba, todos los nuevos usuarios</p>
                <p>serán automáticamente asignados como administradores</p>
              </div>
              
              <Button
                onClick={handleGitHubSignIn}
                className="w-full flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800"
                size="lg"
              >
                <Github className="h-5 w-5" />
                <span>Continuar con GitHub</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="text-center text-xs text-gray-500 mt-6">
                <p>Al continuar, aceptas nuestros términos de servicio</p>
                <p>y política de privacidad</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
