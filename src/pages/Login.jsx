import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors } from '../constants/theme';
import { login } from '../api/auth/auth.service.js';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'User name is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrors({ username: message });
    } finally {
      setIsLoading(false);
    }
   
    setTimeout(() => {
      if (username === '123' && password === '123') {
        // Dummy success login; navigate to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        setErrors({ username: 'Invalid username or password' });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: colors.primary.gradient }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Moif
          </h1>
          <p className="text-sm mt-1 opacity-80">Back Office</p>
        </div>

        <div>
          <p className="text-sm max-w-xs leading-relaxed opacity-70">
            Inventory management, sales, purchases, and accounting in one place.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs opacity-60">
          <span className="w-8 h-px bg-white/50" />
          Ver.24.Nxt.06.24
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">

          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-xl font-bold" style={{ color: colors.primary.main }}>
              Moif Back Office
            </h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <div className="mb-8">
              <h2
                className="text-lg font-semibold text-center uppercase"
                style={{ color: colors.primary.main }}
              >
                SIGN IN
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Enter your credentials to access the back office
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  User name
                </label>
                <input
                  type="text"
                  placeholder="Enter user name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      passwordRef.current?.focus();
                    }
                  }}
                  className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                    errors.username
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#800000]'
                  }`}
                />
                {errors.username && (
                  <span className="text-[11px] text-red-500">
                    {errors.username}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 pr-9 text-sm outline-none ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-[#800000]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      // Eye off icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.53 2.47 2.47 3.53 5.2 6.26C3.34 7.35 2 9.06 1.5 12c1.6 3.9 5.5 7 10.5 7 2.02 0 3.86-.47 5.5-1.3l3.47 3.47 1.06-1.06L3.53 2.47zM12 17c-2.76 0-5-2.24-5-5 0-.64.12-1.25.34-1.81l1.54 1.54A3 3 0 0 0 12 15a2.99 2.99 0 0 0 2.27-1.06l1.7 1.7A6.96 6.96 0 0 1 12 17zm0-10c4.97 0 8.87 3.1 10.5 7-.46 1.13-1.08 2.15-1.84 3.04l-3.03-3.03c.23-.61.37-1.27.37-1.96 0-2.76-2.24-5-5-5-.69 0-1.35.14-1.96.37L8.96 4.34A11.1 11.1 0 0 1 12 3z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path
                          d="M12 5C7 5 3.1 8.1 1.5 12c1.6 3.9 5.5 7 10.5 7s8.9-3.1 10.5-7C20.9 8.1 17 5 12 5zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] text-red-500">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-md bg-[#800000] px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#6a0000] transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <p className="mt-6 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
              Moif Back Office · Ver.24.Nxt.06.24
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;