import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

export function middleware(request: NextRequest, event: NextFetchEvent) {
  const { url } = request;
  const { pathname, origin } = new URL(url);
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const domain = `${protocol}://${host}`;

//   if (pathname.startsWith('/')) {
//     if (
//       request.cookies.get('user') === undefined &&
//       pathname !== '/auth'
//     )
//       return NextResponse.redirect(`${domain}/auth`);
//   }
}
