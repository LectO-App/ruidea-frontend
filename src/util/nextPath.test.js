import { safeNextPath, nextFromLocation } from './nextPath';

test('a path on this site is kept', () => {
	expect(safeNextPath('/mostrar')).toBe('/mostrar');
	expect(safeNextPath('/dashboard?tab=1#arriba')).toBe('/dashboard?tab=1#arriba');
});

test.each([undefined, '', 'mostrar', 'https://evil.example/', '//evil.example/x', '/\\evil.example', '/a b', '/login', '/entrar/abc', `/${'a'.repeat(300)}`])(
	'%p falls back to the dashboard',
	path => expect(safeNextPath(path)).toBe('/dashboard')
);

test('the next path comes from the location ProtectedRoute redirected from', () => {
	expect(nextFromLocation({ state: { from: { pathname: '/mostrar', search: '?x=1', hash: '' } } })).toBe('/mostrar?x=1');
	expect(nextFromLocation({ state: undefined })).toBe('/dashboard');
	expect(nextFromLocation({ state: { from: 'https://evil.example/' } })).toBe('/dashboard');
});
