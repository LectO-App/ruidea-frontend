import React, { useState } from 'react';

const LENGTH = 6;

export const onlyDigits = value => String(value || '').replace(/\D/g, '').slice(0, LENGTH);

// The 6-digit code as ONE labelled input: phones offer the code from the email
// (autocomplete one-time-code), and pasting "482 913" or "482913" fills it. The six boxes
// are drawn behind the input and are hidden from screen readers.
const CodeField = ({ id, label, value, onChange, errorId }) => {
	const [focused, setFocused] = useState(false);
	const active = Math.min(value.length, LENGTH - 1);

	return (
		<div className='code-field'>
			<label htmlFor={id}>{label}</label>
			<div className={`code-boxes${focused ? ' is-focused' : ''}`}>
				<input
					id={id}
					type='text'
					inputMode='numeric'
					autoComplete='one-time-code'
					pattern='[0-9]*'
					value={value}
					onChange={e => onChange(onlyDigits(e.target.value))}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					aria-describedby={errorId}
				/>
				{Array.from({ length: LENGTH }, (_, i) => (
					<span key={i} aria-hidden='true' className={`code-box${focused && i === active ? ' is-active' : ''}`}>
						{value[i] || ''}
					</span>
				))}
			</div>
		</div>
	);
};

export default CodeField;
