import 'better-auth';

declare module 'better-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: 'USER' | 'ADMIN';
      phone?: string | null;
    };
    expires: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: 'USER' | 'ADMIN';
    phone?: string | null;
  }
}
