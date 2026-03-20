@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color: #0f172a;
  background: #e9f3ee;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at top, rgba(10, 207, 131, 0.18), transparent 30%),
    #e9f3ee;
}

* {
  box-sizing: border-box;
}

.field {
  width: 100%;
  border: 1px solid #d8e7de;
  background: #f8fcf9;
  border-radius: 18px;
  padding: 0.9rem 1rem;
  font: inherit;
  color: #0f172a;
}

.field:focus {
  outline: 2px solid rgba(10, 207, 131, 0.2);
  border-color: #0acf83;
}

.hb-loader-pattern {
  background-image:
    repeating-linear-gradient(
      135deg,
      transparent 0,
      transparent 52px,
      rgba(10, 207, 131, 0.35) 52px,
      rgba(10, 207, 131, 0.35) 56px,
      transparent 56px,
      transparent 108px
    );
  position: relative;
}

.hb-loader-pattern::before {
  content: 'HB HB HB HB HB HB HB HB HB HB HB HB';
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: clamp(2.4rem, 8vw, 5rem);
  font-weight: 800;
  letter-spacing: 0.35em;
  color: rgba(10, 207, 131, 0.4);
  transform: rotate(-18deg) scale(1.2);
  white-space: pre-wrap;
  line-height: 1.8;
}

.hb-loader-spin {
  animation: hb-spin 1.8s linear infinite;
}

.hb-loader-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
  background: #0acf83;
  animation: hb-bounce 1.2s infinite ease-in-out;
}

.hb-loader-dot-delay-1 {
  animation-delay: 0.15s;
}

.hb-loader-dot-delay-2 {
  animation-delay: 0.3s;
}

.login-mode-shell {
  position: relative;
  overflow: hidden;
}

.login-mode-shell::before {
  content: '';
  position: absolute;
  inset: -20% auto auto -10%;
  width: 180px;
  height: 180px;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
  pointer-events: none;
  transition: transform 360ms ease, opacity 360ms ease;
}

.login-mode-shell.is-animating::before {
  transform: translate(22px, 12px) scale(1.08);
  opacity: 0.9;
}

.login-mode-copy,
.login-mode-form {
  position: relative;
  z-index: 1;
}

.login-mode-shell.is-animating .login-mode-copy {
  animation: login-copy-swap 360ms cubic-bezier(0.22, 1, 0.36, 1);
}

.login-mode-shell.is-animating .login-mode-form {
  animation: login-form-swap 400ms cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes hb-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes hb-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.7);
    opacity: 0.45;
  }
  40% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes login-copy-swap {
  0% {
    opacity: 0.45;
    transform: translateY(8px) scale(0.985);
  }
  60% {
    opacity: 1;
    transform: translateY(-2px) scale(1.01);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes login-form-swap {
  0% {
    opacity: 0.55;
    transform: translateY(16px);
  }
  55% {
    opacity: 1;
    transform: translateY(-3px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
