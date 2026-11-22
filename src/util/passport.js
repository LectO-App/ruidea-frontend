// The random share token (never the sequential passport number). A backend from before share
// tokens doesn't send one; fall back to the number-based link so the deploy order doesn't matter.
export const passportUrl = usuario =>
	usuario.shareToken
		? `${window.location.origin}/verificar/${encodeURIComponent(usuario.shareToken)}`
		: `${window.location.origin}/verificar/${usuario.numeroDocumento}/${usuario.numeroPasaporte}`;

// Same 7-digit form as the PDF and the public passport page.
export const paddedPassportNumber = numero => String(numero).padStart(7, '0');
