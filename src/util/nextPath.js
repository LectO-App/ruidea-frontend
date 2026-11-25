// Where to go after signing in. Only a path on this site counts ("/mostrar"), never another
// origin ("//host", "/\host", "https://…"), and never the sign-in pages themselves.
export const DEFAULT_NEXT = '/dashboard';

const SAFE = /^\/(?![/\\])[^\\\s]*$/;
const SIGN_IN = /^\/(login|entrar)(\/|$|\?|#)/;

export const safeNextPath = path =>
	typeof path === 'string' && path.length <= 300 && SAFE.test(path) && !SIGN_IN.test(path) ? path : DEFAULT_NEXT;

// The page a signed-out visitor tried to open: ProtectedRoute puts it in location.state.from.
export const nextFromLocation = location => {
	const from = location && location.state && location.state.from;
	if (!from || typeof from.pathname !== 'string') return DEFAULT_NEXT;
	return safeNextPath(`${from.pathname}${from.search || ''}${from.hash || ''}`);
};
