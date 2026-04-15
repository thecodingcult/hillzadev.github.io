module.exports = {
    content: ['./index.html'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                'bg-main': '#050505',
                'cyan-glow': '#22d3ee',
                'purple-glow': '#a855f7',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
            }
        }
    }
};
