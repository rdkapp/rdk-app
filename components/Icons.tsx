
import React from 'react';

export const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H5v-2H3v-2H1v-4a6 6 0 0110.257-4.257" />
    </svg>
);

export const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.828 6.828C34.337 2.89 29.537 1 24 1C10.745 1 0 11.745 0 25s10.745 24 24 24s24-10.745 24-24c0-1.282-.123-2.527-.356-3.717z" />
        <path fill="#FF3D00" d="M6.306 14.691c-1.645 3.328-2.656 7.089-2.656 11.129s1.011 7.801 2.656 11.129L14.4 39.231C11.332 35.131 9.25 30.345 9.25 25s2.082-10.131 5.15-14.231L6.306 14.691z" />
        <path fill="#4CAF50" d="M24 48c5.523 0 10.323-1.89 14.23-5.068l-8.09-6.303c-2.476 1.666-5.594 2.668-9.14 2.668-5.062 0-9.45-2.731-11.55-6.702l-8.1 6.303C8.612 43.12 15.65 48 24 48z" />
        <path fill="#1976D2" d="M43.611 20.083H24v8h19.611c.341-2.738.118-5.556-1.024-8z" />
    </svg>
);

export const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

export const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
