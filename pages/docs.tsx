import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
  };
  paths: Record<string, unknown>;
  components?: Record<string, unknown>;
}

const APIDocs = () => {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpec = async () => {
      try {
        const response = await fetch('/api/docs');
        if (!response.ok) {
          throw new Error('Failed to fetch API specification');
        }
        const data = await response.json();
        setSpec(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSpec();
  }, []);

  return (
    <div className='min-h-screen bg-gray-50'>
      <Navigation />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold text-gray-900'>
            Documentación de la API
          </h1>
          <p className='text-gray-600 mt-2'>
            Documentación completa de todos los endpoints de la API con ejemplos
            y esquemas
          </p>
        </div>

        {loading ? (
          <div className='flex items-center justify-center min-h-screen'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900'></div>
          </div>
        ) : error ? (
          <div className='flex items-center justify-center min-h-screen'>
            <div className='text-center'>
              <h1 className='text-2xl font-bold text-red-600 mb-4'>Error</h1>
              <p className='text-gray-600'>{error}</p>
            </div>
          </div>
        ) : spec ? (
          <SwaggerUI spec={spec} />
        ) : null}
      </div>
    </div>
  );
};

export default APIDocs;
