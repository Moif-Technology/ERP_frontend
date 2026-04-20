import { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../../shared/constants/theme';
import * as authApi from '../../../core/auth/auth.api.js';

function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [info, setInfo] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const validateSend = () => {
    const next = {};
    if (!usernameOrEmail.trim()) {
      next.usernameOrEmail = 'Email or username is required';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateReset = () => {
    const next = {};
    if (!usernameOrEmail.trim()) {
      next.usernameOrEmail = 'Email or username is required';
    }
    const digits = otp.replace(/\D/g, '');
    if (digits.length !== 6) next.otp = 'Enter the 6-digit code from the API console';
    if (!newPassword || newPassword.length < 8) {
      next.newPassword = 'Password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validateSend()) return;
    setIsSendingOtp(true);
    setErrors({});
    setInfo('');
    try {
      const { data } = await authApi.requestForgotPasswordOtp(usernameOrEmail.trim());
      setInfo(
        data?.message ||
          'If an account exists, a code was generated. Check the API server terminal for the OTP.'
      );
    } catch (err) {
      const message =
        err.response?.data?.message || 'Could not send code. Try again.';
      setErrors({ form: message });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!validateReset()) return;
    setIsResetting(true);
    setErrors({});
    setInfo('');
    try {
      const { data } = await authApi.requestResetPassword({
        usernameOrEmail: usernameOrEmail.trim(),
        otp: otp.replace(/\D/g, ''),
        newPassword,
      });
      setInfo(data?.message || 'Password updated. You can sign in now.');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Reset failed. Check the code and try again.';
      setErrors({ form: message });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white"
        style={{ background: colors.primary.gradient }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moif</h1>
          <p className="text-sm mt-1 opacity-80">Back Office</p>
        </div>
        <p className="text-sm max-w-xs leading-relaxed opacity-70">
          Reset your password using a one-time code. In development, the code is printed in the
          API server console.
        </p>
        <div className="flex items-center gap-2 text-xs opacity-60">
          <span className="w-8 h-px bg-white/50" />
          Ver.24.Nxt.06.24
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-xl font-bold" style={{ color: colors.primary.main }}>
              Forgot password
            </h1>
            <p className="text-sm text-gray-500 mt-1">Request a code, then set a new password</p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
            <div className="mb-8">
              <h2
                className="text-lg font-semibold text-center uppercase"
                style={{ color: colors.primary.main }}
              >
                Reset password
              </h2>
              <p className="text-sm text-gray-500 mt-1 text-center">
                Use the same email or username you use to sign in
              </p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {errors.form && (
                <p className="rounded-md bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
                  {errors.form}
                </p>
              )}
              {info && (
                <p className="rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-800">
                  {info}
                </p>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-700">Email or username</label>
                <input
                  type="text"
                  autoComplete="username"
                  placeholder="Email or username"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                    errors.usernameOrEmail
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-gray-300 focus:border-[#800000]'
                  }`}
                />
                {errors.usernameOrEmail && (
                  <span className="text-[11px] text-red-500">{errors.usernameOrEmail}</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full rounded-md border border-[#800000] bg-white px-4 py-2.5 text-sm font-semibold text-[#800000] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-50 transition-colors"
              >
                {isSendingOtp ? 'Sending…' : 'Send OTP (check API console)'}
              </button>

              <div className="border-t border-gray-100 pt-5 space-y-5">
                <p className="text-xs text-gray-500 text-center">Then enter the code and new password</p>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">One-time code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm outline-none tracking-widest ${
                      errors.otp ? 'border-red-400' : 'border-gray-300 focus:border-[#800000]'
                    }`}
                  />
                  {errors.otp && (
                    <span className="text-[11px] text-red-500">{errors.otp}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">New password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                      errors.newPassword ? 'border-red-400' : 'border-gray-300 focus:border-[#800000]'
                    }`}
                  />
                  {errors.newPassword && (
                    <span className="text-[11px] text-red-500">{errors.newPassword}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-700">Confirm new password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm outline-none ${
                      errors.confirmPassword
                        ? 'border-red-400'
                        : 'border-gray-300 focus:border-[#800000]'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <span className="text-[11px] text-red-500">{errors.confirmPassword}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isResetting}
                  className="w-full rounded-md bg-[#800000] px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[#6a0000] transition-colors"
                >
                  {isResetting ? 'Updating…' : 'Update password'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm">
              <Link to="/login" className="font-medium text-[#800000] hover:underline">
                Back to sign in
              </Link>
            </p>

            <p className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
              Moif Back Office · Ver.24.Nxt.06.24
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
